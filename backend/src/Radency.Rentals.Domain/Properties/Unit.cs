using Radency.Rentals.Domain.Common;
using Radency.Rentals.Domain.Leases;

namespace Radency.Rentals.Domain.Properties;

public sealed class Unit : IVersioned
{
    private Unit()
    {
    }

    public Guid Id { get; private set; }

    public Guid PropertyId { get; private set; }

    public Property Property { get; private set; } = null!;

    public string UnitNumber { get; private set; } = string.Empty;

    public int Bedrooms { get; private set; }

    public decimal MonthlyRent { get; private set; }

    public int UnitTypeId { get; private set; }

    public UnitType UnitType { get; private set; } = null!;

    public List<Lease> Leases { get; private set; } = [];

    public DateTime CreatedAt { get; private set; }

    public DateTime UpdatedAt { get; private set; }

    public Guid Version { get; set; }

    public static Unit Create(
        Guid id,
        Guid propertyId,
        string unitNumber,
        int bedrooms,
        decimal monthlyRent,
        UnitType unitType,
        DateTime now)
    {
        EnsureSelectable(unitType);

        return new Unit
        {
            Id = id,
            PropertyId = propertyId,
            UnitNumber = unitNumber.Trim(),
            Bedrooms = bedrooms,
            MonthlyRent = monthlyRent,
            UnitTypeId = unitType.Id,
            UnitType = unitType,
            CreatedAt = now,
            UpdatedAt = now,
        };
    }

    public void Update(string unitNumber, int bedrooms, decimal monthlyRent, UnitType unitType, DateTime now)
    {
        // Keeping an inactive type that the unit already uses is allowed;
        // switching to an inactive type is not.
        if (unitType.Id != UnitTypeId)
        {
            EnsureSelectable(unitType);
        }

        UnitNumber = unitNumber.Trim();
        Bedrooms = bedrooms;
        MonthlyRent = monthlyRent;
        UnitTypeId = unitType.Id;
        UnitType = unitType;
        UpdatedAt = now;
    }

    /// <summary>
    /// Touches the unit when a lease is issued so its concurrency version changes.
    /// Two managers approving different applications for the same unit at the same time
    /// will then collide on this row and only one lease can be created.
    /// </summary>
    public void MarkLeased(DateTime now) => UpdatedAt = now;

    private static void EnsureSelectable(UnitType unitType)
    {
        if (!unitType.IsActive)
        {
            throw new BusinessRuleException(
                ErrorCodes.UnitTypeInactive,
                $"Unit type '{unitType.Name}' is inactive and can't be selected.");
        }
    }
}
