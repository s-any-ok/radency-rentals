using Microsoft.EntityFrameworkCore;
using Radency.Rentals.Application.Applications;
using Radency.Rentals.Application.Common;
using Radency.Rentals.Domain.Applications;
using Radency.Rentals.Domain.Common;
using Radency.Rentals.UnitTests.Support;

namespace Radency.Rentals.UnitTests.Application;

public sealed class ApplicationServiceTests : IDisposable
{
    private readonly TestDatabase _db = new();
    private readonly TestUser _applicant = TestUser.Applicant();
    private readonly TestUser _otherApplicant = TestUser.Applicant("Taylor Brooks");
    private readonly TestUser _manager = TestUser.Manager();

    [Fact]
    public async Task Create_is_idempotent_on_the_client_generated_id()
    {
        var unitId = (await _db.SeedUnitsAsync())[0];
        var request = new CreateApplicationRequest(Guid.NewGuid(), unitId);

        await using (var context = _db.CreateContext())
        {
            var (_, created) = await _db.Applications(context, _applicant).CreateAsync(request, default);
            Assert.True(created);
        }

        await using (var context = _db.CreateContext())
        {
            var (replayed, created) = await _db.Applications(context, _applicant).CreateAsync(request, default);
            Assert.False(created);
            Assert.Equal(request.Id, replayed.Id);
            Assert.Equal(1, await context.Applications.CountAsync());
        }
    }

    [Fact]
    public async Task Continue_with_an_invalid_section_returns_field_errors_and_saves_nothing()
    {
        var application = await CreateDraftAsync();

        await using var context = _db.CreateContext();
        var service = _db.Applications(context, _applicant);

        var error = await Assert.ThrowsAsync<RequestValidationException>(() => service.PostFormAsync(
            application.Id,
            new ApplicationFormRequest(
                FormCommand.Continue,
                ApplicationSection.ApplicantInformation,
                new ApplicantInfoDto("Jordan Smith", "not-a-phone", "jordan@example.com", ""),
                null,
                application.Version),
            default));

        Assert.Contains("applicantInfo.phone", error.Errors.Keys);
        Assert.Contains("applicantInfo.currentAddress", error.Errors.Keys);

        var stored = await service.GetAsync(application.Id, default);
        Assert.False(stored.ApplicantInfoCompleted);
        Assert.Equal(application.Version, stored.Version);
    }

    [Fact]
    public async Task Residence_errors_are_keyed_by_row_and_field()
    {
        var application = await CreateDraftAsync();

        await using var context = _db.CreateContext();
        var error = await Assert.ThrowsAsync<RequestValidationException>(() => _db.Applications(context, _applicant).PostFormAsync(
            application.Id,
            new ApplicationFormRequest(
                FormCommand.Continue,
                ApplicationSection.ResidenceHistory,
                null,
                [new ResidenceDto("2 Oak St", "Pat Lee", "+1 555 123 4567", new DateOnly(2024, 5, 1), new DateOnly(2023, 1, 1))],
                application.Version),
            default));

        Assert.Contains("residences[0].moveOutDate", error.Errors.Keys);
    }

    [Fact]
    public async Task Continue_saves_each_section_and_submit_moves_to_submitted()
    {
        var application = await CompleteDraftAsync();

        await using var context = _db.CreateContext();
        var submitted = await _db.Applications(context, _applicant).PostFormAsync(
            application.Id,
            new ApplicationFormRequest(FormCommand.Submit, null, null, null, application.Version),
            default);

        Assert.Equal(ApplicationStatus.Submitted, submitted.Status);
        Assert.False(submitted.IsEditable);
        Assert.True(submitted.CanWithdraw);
    }

    [Fact]
    public async Task A_stale_version_is_rejected_as_a_concurrency_conflict()
    {
        var application = await CreateDraftAsync();
        var staleVersion = application.Version;

        await using (var context = _db.CreateContext())
        {
            await _db.Applications(context, _applicant).PostFormAsync(application.Id, ApplicantInfoForm(staleVersion), default);
        }

        await using (var context = _db.CreateContext())
        {
            await Assert.ThrowsAsync<ConcurrencyException>(() =>
                _db.Applications(context, _applicant).PostFormAsync(application.Id, ApplicantInfoForm(staleVersion), default));
        }
    }

    [Fact]
    public async Task Another_applicant_cannot_see_or_change_the_application()
    {
        var application = await CreateDraftAsync();

        await using var context = _db.CreateContext();
        var service = _db.Applications(context, _otherApplicant);

        await Assert.ThrowsAsync<NotFoundException>(() => service.GetAsync(application.Id, default));
        await Assert.ThrowsAsync<NotFoundException>(() =>
            service.PostFormAsync(application.Id, ApplicantInfoForm(application.Version), default));
    }

    [Fact]
    public async Task Approval_issues_a_lease_and_a_second_approval_for_the_unit_is_rejected()
    {
        var unitId = (await _db.SeedUnitsAsync())[0];
        var first = await SubmitAsync(await CompleteDraftAsync(unitId, _applicant), _applicant);
        var second = await SubmitAsync(await CompleteDraftAsync(unitId, _otherApplicant), _otherApplicant);

        await using (var context = _db.CreateContext())
        {
            var approved = await _db.Applications(context, _manager).ReviewAsync(
                first.Id,
                new ReviewApplicationRequest(ReviewOutcome.Approve, null, first.Version),
                default);

            Assert.Equal(ApplicationStatus.Approved, approved.Status);
            Assert.NotNull(approved.Lease);
            Assert.Equal(approved.Lease.StartDate.AddMonths(12), approved.Lease.EndDate);
        }

        await using (var context = _db.CreateContext())
        {
            var service = _db.Applications(context, _manager);
            var error = await Assert.ThrowsAsync<BusinessRuleException>(() => service.ReviewAsync(
                second.Id,
                new ReviewApplicationRequest(ReviewOutcome.Approve, null, second.Version),
                default));

            Assert.Equal(ErrorCodes.UnitHasActiveLease, error.Code);

            // Other open applications for the unit are left as they are.
            Assert.Equal(ApplicationStatus.Submitted, (await service.GetAsync(second.Id, default)).Status);
            Assert.Equal(1, await context.Leases.CountAsync());
        }

        await using (var context = _db.CreateContext())
        {
            var available = await _db.Units(context, _applicant).ListAvailableAsync(null, default);
            Assert.DoesNotContain(available, u => u.Id == unitId);
        }
    }

    [Fact]
    public async Task Return_requires_a_comment_and_records_who_reviewed_it()
    {
        var submitted = await SubmitAsync(await CompleteDraftAsync(), _applicant);

        await using (var context = _db.CreateContext())
        {
            var error = await Assert.ThrowsAsync<RequestValidationException>(() => _db.Applications(context, _manager).ReviewAsync(
                submitted.Id,
                new ReviewApplicationRequest(ReviewOutcome.Return, " ", submitted.Version),
                default));
            Assert.Contains("comment", error.Errors.Keys);
        }

        await using (var context = _db.CreateContext())
        {
            var service = _db.Applications(context, _manager);
            await service.ReviewAsync(
                submitted.Id,
                new ReviewApplicationRequest(ReviewOutcome.Return, "Please fix the phone number.", submitted.Version),
                default);

            var history = await service.GetHistoryAsync(submitted.Id, default);
            var last = history[^1];
            Assert.Equal(ApplicationStatus.Returned, last.ToStatus);
            Assert.Equal(ReviewOutcome.Return, last.Outcome);
            Assert.Equal("Please fix the phone number.", last.Comment);
            Assert.Equal(_manager.Name, last.ChangedBy);
        }
    }

    [Fact]
    public async Task List_filters_in_the_database_and_applicants_only_see_their_own()
    {
        var units = await _db.SeedUnitsAsync(3);
        await CreateDraftAsync(units[0], _applicant);
        await SubmitAsync(await CompleteDraftAsync(units[1], _applicant), _applicant);
        await CreateDraftAsync(units[2], _otherApplicant);

        await using var context = _db.CreateContext();

        var own = await _db.Applications(context, _applicant).ListAsync(new ApplicationListQuery(), default);
        Assert.Equal(2, own.Total);

        var managerSubmitted = await _db.Applications(context, _manager)
            .ListAsync(new ApplicationListQuery { Status = ApplicationStatus.Submitted }, default);
        Assert.Equal(1, managerSubmitted.Total);

        var managerPaged = await _db.Applications(context, _manager)
            .ListAsync(new ApplicationListQuery { PageSize = 2, Page = 2, SortBy = ApplicationSortField.CreatedAt }, default);
        Assert.Equal(3, managerPaged.Total);
        Assert.Single(managerPaged.Items);
    }

    [Fact]
    public async Task Manager_notes_are_versioned()
    {
        var application = await CreateDraftAsync();

        await using var context = _db.CreateContext();
        var service = _db.Applications(context, _manager);

        var created = await service.UpdateManagerNoteAsync(application.Id, new UpdateManagerNoteRequest("Called the landlord.", null), default);
        var updated = await service.UpdateManagerNoteAsync(application.Id, new UpdateManagerNoteRequest("Landlord confirmed.", created.Version), default);

        Assert.Equal("Landlord confirmed.", updated.Text);
        await Assert.ThrowsAsync<ConcurrencyException>(() =>
            service.UpdateManagerNoteAsync(application.Id, new UpdateManagerNoteRequest("Stale edit", created.Version), default));
    }

    public void Dispose() => _db.Dispose();

    private async Task<ApplicationDto> CreateDraftAsync(Guid? unitId = null, TestUser? applicant = null)
    {
        unitId ??= (await _db.SeedUnitsAsync())[0];
        await using var context = _db.CreateContext();
        var (application, _) = await _db.Applications(context, applicant ?? _applicant)
            .CreateAsync(new CreateApplicationRequest(Guid.NewGuid(), unitId.Value), default);
        return application;
    }

    private async Task<ApplicationDto> CompleteDraftAsync(Guid? unitId = null, TestUser? applicant = null)
    {
        applicant ??= _applicant;
        var draft = await CreateDraftAsync(unitId, applicant);

        await using var context = _db.CreateContext();
        var service = _db.Applications(context, applicant);
        var withInfo = await service.PostFormAsync(draft.Id, ApplicantInfoForm(draft.Version), default);
        return await service.PostFormAsync(
            draft.Id,
            new ApplicationFormRequest(
                FormCommand.Continue,
                ApplicationSection.ResidenceHistory,
                null,
                [new ResidenceDto("2 Oak St", "Pat Lee", "+1 555 123 4567", new DateOnly(2022, 5, 1), new DateOnly(2025, 9, 30))],
                withInfo.Version),
            default);
    }

    private async Task<ApplicationDto> SubmitAsync(ApplicationDto application, TestUser applicant)
    {
        await using var context = _db.CreateContext();
        return await _db.Applications(context, applicant).PostFormAsync(
            application.Id,
            new ApplicationFormRequest(FormCommand.Submit, null, null, null, application.Version),
            default);
    }

    private static ApplicationFormRequest ApplicantInfoForm(Guid version) =>
        new(
            FormCommand.Continue,
            ApplicationSection.ApplicantInformation,
            new ApplicantInfoDto("Jordan Smith", "+1 555 987 6543", "jordan@example.com", "10 Elm St"),
            null,
            version);
}
