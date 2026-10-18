using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Radency.Rentals.Application.Abstractions;
using Radency.Rentals.Application.Common;
using Radency.Rentals.Application.Units;
using Radency.Rentals.Domain.Common;
using Radency.Rentals.Domain.Properties;

namespace Radency.Rentals.Application.Properties;

public sealed class PropertyService(
    IRentalsDbContext db,
    ICurrentUser currentUser,
    TimeProvider clock,
    IValidator<CreatePropertyRequest> createValidator,
    IValidator<UpdatePropertyRequest> updateValidator)
{
    public async Task<IReadOnlyList<PropertyDto>> ListAsync(CancellationToken ct)
    {
        var today = clock.Today();

        return await db.Properties
            .AsNoTracking()
            .OrderBy(p => p.Name)
            .Select(p => new PropertyDto(
                p.Id,
                p.Name,
                p.Address,
                p.City,
                p.Units.Count,
                p.Units.Count(u => !u.Leases.Any(l => l.StartDate <= today && l.EndDate > today)),
                p.Version))
            .ToListAsync(ct);
    }

    public async Task<PropertyDetailsDto> GetAsync(Guid id, CancellationToken ct)
    {
        var today = clock.Today();

        var property = await db.Properties
            .AsNoTracking()
            .Where(p => p.Id == id)
            .Select(p => new
            {
                p.Id,
                p.Name,
                p.Address,
                p.City,
                p.Version,
                Units = p.Units
                    .OrderBy(u => u.UnitNumber)
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
                    .ToList(),
            })
            .FirstOrDefaultAsync(ct)
            ?? throw new NotFoundException("Property", id);

        return new PropertyDetailsDto(property.Id, property.Name, property.Address, property.City, property.Units, property.Version);
    }

    /// <summary>Idempotent: replaying the same create returns the already created property.</summary>
    public async Task<(PropertyDetailsDto Property, bool Created)> CreateAsync(CreatePropertyRequest request, CancellationToken ct)
    {
        currentUser.EnsurePropertyManager();
        await createValidator.EnsureValidAsync(request, cancellationToken: ct);

        if (await db.Properties.AnyAsync(p => p.Id == request.Id, ct))
        {
            return (await GetAsync(request.Id, ct), false);
        }

        db.Properties.Add(new Property(request.Id, request.Name, request.Address, request.City, clock.UtcNow()));
        await db.SaveChangesAsync(ct);

        return (await GetAsync(request.Id, ct), true);
    }

    public async Task<PropertyDetailsDto> UpdateAsync(Guid id, UpdatePropertyRequest request, CancellationToken ct)
    {
        currentUser.EnsurePropertyManager();
        await updateValidator.EnsureValidAsync(request, cancellationToken: ct);

        var property = await db.Properties.FirstOrDefaultAsync(p => p.Id == id, ct)
            ?? throw new NotFoundException("Property", id);

        db.EnsureVersion(property, request.Version);
        property.Update(request.Name, request.Address, request.City, clock.UtcNow());
        await db.SaveChangesAsync(ct);

        return await GetAsync(id, ct);
    }

    /// <summary>Idempotent: deleting a property that is already gone succeeds.</summary>
    public async Task DeleteAsync(Guid id, Guid version, CancellationToken ct)
    {
        currentUser.EnsurePropertyManager();

        var property = await db.Properties.FirstOrDefaultAsync(p => p.Id == id, ct);
        if (property is null)
        {
            return;
        }

        db.EnsureVersion(property, version);

        if (await db.Applications.AnyAsync(a => a.Unit.PropertyId == id, ct))
        {
            throw new BusinessRuleException(
                ErrorCodes.PropertyInUse,
                "This property has rental applications for its units and can't be removed.");
        }

        db.Properties.Remove(property);
        await db.SaveChangesAsync(ct);
    }
}
