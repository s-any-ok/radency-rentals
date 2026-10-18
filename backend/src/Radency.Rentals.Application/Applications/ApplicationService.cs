using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Radency.Rentals.Application.Abstractions;
using Radency.Rentals.Application.Common;
using Radency.Rentals.Domain.Applications;
using Radency.Rentals.Domain.Common;

namespace Radency.Rentals.Application.Applications;

public sealed class ApplicationService(
    IRentalsDbContext db,
    ICurrentUser currentUser,
    TimeProvider clock,
    IValidator<ApplicantInfoDto> applicantInfoValidator,
    IValidator<ResidenceHistoryInput> residenceHistoryValidator,
    IValidator<ReviewApplicationRequest> reviewValidator,
    IValidator<UpdateManagerNoteRequest> noteValidator)
{
    public const int MaxPageSize = 100;

    /// <summary>
    /// Filtering, sorting and paging all run in the database. Applicants only ever see their own rows.
    /// </summary>
    public async Task<PagedResult<ApplicationListItemDto>> ListAsync(ApplicationListQuery query, CancellationToken ct)
    {
        var applications = db.Applications.AsNoTracking();

        if (!currentUser.IsPropertyManager)
        {
            var userId = currentUser.UserId;
            applications = applications.Where(a => a.ApplicantId == userId);
        }

        if (query.Status is { } status)
        {
            applications = applications.Where(a => a.Status == status);
        }

        if (query.PropertyId is { } propertyId)
        {
            applications = applications.Where(a => a.Unit.PropertyId == propertyId);
        }

        var total = await applications.CountAsync(ct);

        var pageSize = Math.Clamp(query.PageSize, 1, MaxPageSize);
        var page = Math.Max(query.Page, 1);

        var items = await Sort(applications, query.SortBy, query.SortDirection)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(a => new ApplicationListItemDto(
                a.Id,
                a.Status,
                a.UnitId,
                a.Unit.UnitNumber,
                a.Unit.PropertyId,
                a.Unit.Property.Name,
                a.ApplicantInfo != null ? a.ApplicantInfo.FullName : a.ApplicantName,
                a.Unit.MonthlyRent,
                a.CreatedAt,
                a.SubmittedAt,
                a.UpdatedAt))
            .ToListAsync(ct);

        return new PagedResult<ApplicationListItemDto>(items, total, page, pageSize);
    }

    public async Task<ApplicationDto> GetAsync(Guid id, CancellationToken ct) =>
        ToDto(await LoadAsync(id, tracking: false, ct));

    /// <summary>Idempotent: replaying the same create returns the already created draft.</summary>
    public async Task<(ApplicationDto Application, bool Created)> CreateAsync(CreateApplicationRequest request, CancellationToken ct)
    {
        currentUser.EnsureApplicant();

        if (request.Id == Guid.Empty)
        {
            throw RequestValidationException.For("id", "A client-generated id is required.");
        }

        var existing = await db.Applications
            .AsNoTracking()
            .Where(a => a.Id == request.Id)
            .Select(a => new { a.ApplicantId, a.UnitId })
            .FirstOrDefaultAsync(ct);

        if (existing is not null)
        {
            if (existing.ApplicantId != currentUser.UserId || existing.UnitId != request.UnitId)
            {
                throw new BusinessRuleException(ErrorCodes.DuplicateId, "An application with this id already exists.");
            }

            return (await GetAsync(request.Id, ct), false);
        }

        if (!await db.Units.AnyAsync(u => u.Id == request.UnitId, ct))
        {
            throw new NotFoundException("Unit", request.UnitId);
        }

        if (await UnitHasActiveLeaseAsync(request.UnitId, ct))
        {
            throw new BusinessRuleException(ErrorCodes.UnitNotAvailable, "This unit is leased and not available.");
        }

        db.Applications.Add(RentalApplication.Start(request.Id, request.UnitId, currentUser.AsActor(), clock.UtcNow()));
        await db.SaveChangesAsync(ct);

        return (await GetAsync(request.Id, ct), true);
    }

    /// <summary>
    /// Handles the application page's single form post. <see cref="FormCommand.Continue"/> validates
    /// the posted section and persists it only when valid; <see cref="FormCommand.Submit"/> submits.
    /// </summary>
    public async Task<ApplicationDto> PostFormAsync(Guid id, ApplicationFormRequest request, CancellationToken ct)
    {
        currentUser.EnsureApplicant();

        var application = await LoadAsync(id, tracking: true, ct);
        EnsureOwner(application);
        db.EnsureVersion(application, request.Version);

        if (!application.IsEditableByApplicant)
        {
            throw new BusinessRuleException(
                ErrorCodes.ApplicationNotEditable,
                $"The application can't be changed while it is {application.Status}.");
        }

        var now = clock.UtcNow();

        switch (request.Command)
        {
            case FormCommand.Continue:
                await SaveSectionAsync(application, request, now, ct);
                break;

            case FormCommand.Submit:
                application.Submit(await UnitHasActiveLeaseAsync(application.UnitId, ct), currentUser.AsActor(), now);
                break;

            default:
                throw RequestValidationException.For("command", "Unknown command.");
        }

        await db.SaveChangesAsync(ct);
        return ToDto(application);
    }

    public async Task<ApplicationDto> WithdrawAsync(Guid id, WithdrawApplicationRequest request, CancellationToken ct)
    {
        currentUser.EnsureApplicant();

        var application = await LoadAsync(id, tracking: true, ct);
        EnsureOwner(application);
        db.EnsureVersion(application, request.Version);

        application.Withdraw(currentUser.AsActor(), clock.UtcNow());
        await db.SaveChangesAsync(ct);

        return ToDto(application);
    }

    public async Task<ApplicationDto> ReviewAsync(Guid id, ReviewApplicationRequest request, CancellationToken ct)
    {
        currentUser.EnsurePropertyManager();
        await reviewValidator.EnsureValidAsync(request, cancellationToken: ct);

        var application = await LoadAsync(id, tracking: true, ct);
        db.EnsureVersion(application, request.Version);

        var hasActiveLease = request.Outcome == ReviewOutcome.Approve
                             && await UnitHasActiveLeaseAsync(application.UnitId, ct);

        var now = clock.UtcNow();
        var lease = application.Review(
            request.Outcome,
            request.Comment,
            hasActiveLease,
            currentUser.AsActor(),
            clock.Today(),
            now);

        if (lease is not null)
        {
            db.Leases.Add(lease);
            // Bumps the unit's concurrency version: a parallel approval for the same unit
            // fails on save instead of issuing a second lease.
            application.Unit.MarkLeased(now);
        }

        await db.SaveChangesAsync(ct);
        return ToDto(application);
    }

    public async Task<IReadOnlyList<StatusChangeDto>> GetHistoryAsync(Guid id, CancellationToken ct)
    {
        currentUser.EnsurePropertyManager();
        await EnsureExistsAsync(id, ct);

        return await db.ApplicationStatusChanges
            .AsNoTracking()
            .Where(h => h.ApplicationId == id)
            .OrderBy(h => h.ChangedAt)
            .Select(h => new StatusChangeDto(h.Id, h.FromStatus, h.ToStatus, h.Outcome, h.Comment, h.ChangedByName, h.ChangedAt))
            .ToListAsync(ct);
    }

    public async Task<ManagerNoteDto> GetManagerNoteAsync(Guid id, CancellationToken ct)
    {
        currentUser.EnsurePropertyManager();
        await EnsureExistsAsync(id, ct);

        var note = await db.ManagerNotes.AsNoTracking().FirstOrDefaultAsync(n => n.ApplicationId == id, ct);
        return note is null
            ? new ManagerNoteDto(string.Empty, null, null, null)
            : new ManagerNoteDto(note.Text, note.UpdatedByName, note.UpdatedAt, note.Version);
    }

    public async Task<ManagerNoteDto> UpdateManagerNoteAsync(Guid id, UpdateManagerNoteRequest request, CancellationToken ct)
    {
        currentUser.EnsurePropertyManager();
        await noteValidator.EnsureValidAsync(request, cancellationToken: ct);
        await EnsureExistsAsync(id, ct);

        var now = clock.UtcNow();
        var note = await db.ManagerNotes.FirstOrDefaultAsync(n => n.ApplicationId == id, ct);

        if (note is null)
        {
            if (request.Version is not null)
            {
                // The client edited a note that has since been removed or never existed.
                throw new ConcurrencyException();
            }

            note = new ManagerNote(id, request.Text, currentUser.AsActor(), now);
            db.ManagerNotes.Add(note);
        }
        else
        {
            db.EnsureVersion(note, request.Version ?? Guid.Empty);
            note.Update(request.Text, currentUser.AsActor(), now);
        }

        await db.SaveChangesAsync(ct);
        return new ManagerNoteDto(note.Text, note.UpdatedByName, note.UpdatedAt, note.Version);
    }

    private async Task SaveSectionAsync(RentalApplication application, ApplicationFormRequest request, DateTime now, CancellationToken ct)
    {
        switch (request.Section)
        {
            case ApplicationSection.ApplicantInformation:
            {
                var info = request.ApplicantInfo
                           ?? throw RequestValidationException.For("applicantInfo", "Applicant information is required.");
                await applicantInfoValidator.EnsureValidAsync(info, "applicantInfo", ct);
                application.SaveApplicantInfo(
                    new ApplicantInfo(info.FullName, info.Phone, info.Email, info.CurrentAddress),
                    now);
                break;
            }

            case ApplicationSection.ResidenceHistory:
            {
                var input = new ResidenceHistoryInput(request.Residences ?? []);
                await residenceHistoryValidator.EnsureValidAsync(input, cancellationToken: ct);
                application.SaveResidenceHistory(
                    input.Residences.Select(r => new Residence(
                        r.Address,
                        r.LandlordName,
                        r.LandlordPhone,
                        r.MoveInDate,
                        r.MoveOutDate)),
                    now);
                break;
            }

            default:
                throw RequestValidationException.For("section", "Choose which section to save.");
        }
    }

    private async Task<RentalApplication> LoadAsync(Guid id, bool tracking, CancellationToken ct)
    {
        IQueryable<RentalApplication> query = db.Applications
            .Include(a => a.Unit).ThenInclude(u => u.Property)
            .Include(a => a.Unit).ThenInclude(u => u.UnitType)
            .Include(a => a.Lease);

        var application = await (tracking ? query : query.AsNoTracking())
                              .FirstOrDefaultAsync(a => a.Id == id, ct)
                          ?? throw new NotFoundException("Application", id);

        // Applicants can't see other people's applications; answer 404 so ids don't leak.
        if (!currentUser.IsPropertyManager && application.ApplicantId != currentUser.UserId)
        {
            throw new NotFoundException("Application", id);
        }

        return application;
    }

    private async Task EnsureExistsAsync(Guid id, CancellationToken ct)
    {
        if (!await db.Applications.AnyAsync(a => a.Id == id, ct))
        {
            throw new NotFoundException("Application", id);
        }
    }

    private void EnsureOwner(RentalApplication application)
    {
        if (application.ApplicantId != currentUser.UserId)
        {
            throw new ForbiddenException("Only the applicant can change this application.");
        }
    }

    private Task<bool> UnitHasActiveLeaseAsync(Guid unitId, CancellationToken ct)
    {
        var today = clock.Today();
        return db.Leases.AnyAsync(l => l.UnitId == unitId && l.StartDate <= today && l.EndDate > today, ct);
    }

    private static IQueryable<RentalApplication> Sort(
        IQueryable<RentalApplication> query,
        ApplicationSortField sortBy,
        SortDirection direction)
    {
        var ordered = (sortBy, direction) switch
        {
            (ApplicationSortField.CreatedAt, SortDirection.Asc) => query.OrderBy(a => a.CreatedAt),
            (ApplicationSortField.CreatedAt, _) => query.OrderByDescending(a => a.CreatedAt),
            (ApplicationSortField.SubmittedAt, SortDirection.Asc) => query.OrderBy(a => a.SubmittedAt),
            (ApplicationSortField.SubmittedAt, _) => query.OrderByDescending(a => a.SubmittedAt),
            (ApplicationSortField.Status, SortDirection.Asc) => query.OrderBy(a => a.Status),
            (ApplicationSortField.Status, _) => query.OrderByDescending(a => a.Status),
            (ApplicationSortField.Property, SortDirection.Asc) => query.OrderBy(a => a.Unit.Property.Name).ThenBy(a => a.Unit.UnitNumber),
            (ApplicationSortField.Property, _) => query.OrderByDescending(a => a.Unit.Property.Name).ThenByDescending(a => a.Unit.UnitNumber),
            (ApplicationSortField.Applicant, SortDirection.Asc) => query.OrderBy(a => a.ApplicantName),
            (ApplicationSortField.Applicant, _) => query.OrderByDescending(a => a.ApplicantName),
            (_, SortDirection.Asc) => query.OrderBy(a => a.UpdatedAt),
            _ => query.OrderByDescending(a => a.UpdatedAt),
        };

        // Tie-breaker keeps paging stable when sort keys are equal.
        return ordered.ThenBy(a => a.Id);
    }

    private ApplicationDto ToDto(RentalApplication a)
    {
        var isOwner = currentUser.IsApplicant && a.ApplicantId == currentUser.UserId;

        return new ApplicationDto(
            a.Id,
            a.Status,
            new UnitSummaryDto(
                a.Unit.Id,
                a.Unit.UnitNumber,
                a.Unit.Bedrooms,
                a.Unit.MonthlyRent,
                a.Unit.UnitType.Name,
                a.Unit.PropertyId,
                a.Unit.Property.Name,
                $"{a.Unit.Property.Address}, {a.Unit.Property.City}"),
            a.ApplicantId,
            a.ApplicantName,
            a.ApplicantInfo is { } info
                ? new ApplicantInfoDto(info.FullName, info.Phone, info.Email, info.CurrentAddress)
                : null,
            a.Residences
                .Select(r => new ResidenceDto(r.Address, r.LandlordName, r.LandlordPhone, r.MoveInDate, r.MoveOutDate))
                .ToList(),
            a.ApplicantInfoCompleted,
            a.ResidenceHistoryCompleted,
            IsEditable: isOwner && a.IsEditableByApplicant,
            CanSubmit: isOwner && a.CanSubmit,
            CanWithdraw: isOwner && a.CanWithdraw,
            CanReview: currentUser.IsPropertyManager && a.CanReview,
            a.Lease is { } lease ? new LeaseDto(lease.Id, lease.StartDate, lease.EndDate) : null,
            a.LastReviewComment,
            a.CreatedAt,
            a.UpdatedAt,
            a.SubmittedAt,
            a.Version);
    }
}
