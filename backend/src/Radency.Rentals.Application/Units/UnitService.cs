using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Radency.Rentals.Application.Abstractions;
using Radency.Rentals.Application.Common;
using Radency.Rentals.Domain.Common;
using Radency.Rentals.Domain.Properties;

namespace Radency.Rentals.Application.Units;

public sealed class UnitService(
    IRentalsDbContext db,
    ICurrentUser currentUser,
    TimeProvider clock,
    IValidator<CreateUnitRequest> createValidator,
    IValidator<UpdateUnitRequest> updateValidator)
{
    public async Task<IReadOnlyList<UnitTypeDto>> ListUnitTypesAsync(CancellationToken ct) =>
        await db.UnitTypes
            .AsNoTracking()
            .OrderBy(t => t.Name)
            .Select(t => new UnitTypeDto(t.Id, t.Name, t.IsActive))
            .ToListAsync(ct);

    /// <summary>Units whose lease term doesn't cover today, i.e. units an applicant can apply for.</summary>
    public async Task<IReadOnlyList<AvailableUnitDto>> ListAvailableAsync(Guid? propertyId, CancellationToken ct)
    {
        var today = clock.Today();

        var query = db.Units
            .AsNoTracking()
            .Where(u => !u.Leases.Any(l => l.StartDate <= today && l.EndDate > today));

        if (propertyId is { } pid)
        {
            query = query.Where(u => u.PropertyId == pid);
        }

        return await query
            .OrderBy(u => u.Property.Name)
            .ThenBy(u => u.UnitNumber)
            .Select(u => new AvailableUnitDto(
                u.Id,
                u.PropertyId,
                u.Property.Name,
                u.Property.Address,
                u.Property.City,
                u.UnitNumber,
                u.Bedrooms,
                u.MonthlyRent,
                u.UnitType.Name))
            .ToListAsync(ct);
    }

    /// <summary>Idempotent: replaying the same create returns the already created unit.</summary>
    public async Task<(UnitDto Unit, bool Created)> CreateAsync(Guid propertyId, CreateUnitRequest request, CancellationToken ct)
    {
        currentUser.EnsurePropertyManager();
        await createValidator.EnsureValidAsync(request, cancellationToken: ct);

        if (await db.Units.AnyAsync(u => u.Id == request.Id, ct))
        {
            return (await GetAsync(request.Id, ct), false);
        }

        if (!await db.Properties.AnyAsync(p => p.Id == propertyId, ct))
        {
            throw new NotFoundException("Property", propertyId);
        }

        await EnsureUnitNumberIsFreeAsync(propertyId, request.UnitNumber, exceptUnitId: null, ct);
        var unitType = await FindUnitTypeAsync(request.UnitTypeId, ct);

        db.Units.Add(Unit.Create(
            request.Id,
            propertyId,
            request.UnitNumber,
            request.Bedrooms,
            request.MonthlyRent,
            unitType,
            clock.UtcNow()));
        await db.SaveChangesAsync(ct);

        return (await GetAsync(request.Id, ct), true);
    }

    public async Task<UnitDto> UpdateAsync(Guid id, UpdateUnitRequest request, CancellationToken ct)
    {
        currentUser.EnsurePropertyManager();
        await updateValidator.EnsureValidAsync(request, cancellationToken: ct);

        var unit = await db.Units.Include(u => u.UnitType).FirstOrDefaultAsync(u => u.Id == id, ct)
            ?? throw new NotFoundException("Unit", id);

        db.EnsureVersion(unit, request.Version);
        await EnsureUnitNumberIsFreeAsync(unit.PropertyId, request.UnitNumber, exceptUnitId: unit.Id, ct);
        var unitType = await FindUnitTypeAsync(request.UnitTypeId, ct);

        unit.Update(request.UnitNumber, request.Bedrooms, request.MonthlyRent, unitType, clock.UtcNow());
        await db.SaveChangesAsync(ct);

        return await GetAsync(id, ct);
    }

    /// <summary>Idempotent: deleting a unit that is already gone succeeds.</summary>
    public async Task DeleteAsync(Guid id, Guid version, CancellationToken ct)
    {
        currentUser.EnsurePropertyManager();

        var unit = await db.Units.FirstOrDefaultAsync(u => u.Id == id, ct);
        if (unit is null)
        {
            return;
        }

        db.EnsureVersion(unit, version);

        if (await db.Applications.AnyAsync(a => a.UnitId == id, ct))
        {
            throw new BusinessRuleException(
                ErrorCodes.UnitInUse,
                "This unit has rental applications and can't be removed.");
        }

        db.Units.Remove(unit);
        await db.SaveChangesAsync(ct);
    }

    public async Task<UnitDto> GetAsync(Guid id, CancellationToken ct)
    {
        var today = clock.Today();

        return await db.Units
            .AsNoTracking()
            .Where(u => u.Id == id)
            .Select(u => new UnitDto(
                u.Id,
                u.PropertyId,
                u.UnitNumber,
                u.Bedrooms,
                u.MonthlyRent,
                u.UnitTypeId,
                u.UnitType.Name,
                u.UnitType.IsActive,
                !u.Leases.Any(l => l.StartDate <= today && l.EndDate > today),
                u.Leases
                    .Where(l => l.StartDate <= today && l.EndDate > today)
                    .Select(l => (DateOnly?)l.EndDate)
                    .Max(),
                u.Version))
            .FirstOrDefaultAsync(ct)
            ?? throw new NotFoundException("Unit", id);
    }

    private async Task EnsureUnitNumberIsFreeAsync(Guid propertyId, string unitNumber, Guid? exceptUnitId, CancellationToken ct)
    {
        var normalized = unitNumber.Trim();
        var taken = await db.Units.AnyAsync(
            u => u.PropertyId == propertyId && u.UnitNumber == normalized && u.Id != exceptUnitId,
            ct);

        if (taken)
        {
            throw new RequestValidationException(new Dictionary<string, string[]>
            {
                ["unitNumber"] = [$"Unit {normalized} already exists in this property."],
            });
        }
    }

    private async Task<UnitType> FindUnitTypeAsync(int unitTypeId, CancellationToken ct) =>
        await db.UnitTypes.FirstOrDefaultAsync(t => t.Id == unitTypeId, ct)
        ?? throw RequestValidationException.For("unitTypeId", "Unknown unit type.");
}
