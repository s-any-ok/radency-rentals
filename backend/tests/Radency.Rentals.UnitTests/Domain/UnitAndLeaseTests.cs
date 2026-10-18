using Radency.Rentals.Domain.Common;
using Radency.Rentals.Domain.Leases;
using Radency.Rentals.Domain.Properties;

namespace Radency.Rentals.UnitTests.Domain;

public sealed class UnitAndLeaseTests
{
    private static readonly DateTime Now = new(2026, 10, 15, 12, 0, 0, DateTimeKind.Utc);

    [Fact]
    public void Inactive_unit_type_cannot_be_selected_for_a_new_unit()
    {
        var retired = new UnitType("Townhouse", isActive: false);

        var error = Assert.Throws<BusinessRuleException>(
            () => Unit.Create(Guid.NewGuid(), Guid.NewGuid(), "101", 2, 1500m, retired, Now));

        Assert.Equal(ErrorCodes.UnitTypeInactive, error.Code);
    }

    [Fact]
    public void Unit_keeps_its_inactive_type_when_edited()
    {
        var type = new UnitType("Townhouse");
        var unit = Unit.Create(Guid.NewGuid(), Guid.NewGuid(), "101", 2, 1500m, type, Now);
        type.Deactivate();

        unit.Update("101A", 3, 1700m, type, Now);

        Assert.Equal("101A", unit.UnitNumber);
        Assert.Same(type, unit.UnitType);
    }

    [Fact]
    public void Unit_cannot_switch_to_a_different_inactive_type()
    {
        var current = WithId(new UnitType("Apartment"), 1);
        var retired = WithId(new UnitType("Penthouse", isActive: false), 2);
        var unit = Unit.Create(Guid.NewGuid(), Guid.NewGuid(), "101", 2, 1500m, current, Now);

        Assert.Throws<BusinessRuleException>(() => unit.Update("101", 2, 1500m, retired, Now));
    }

    [Fact]
    public void Lease_covers_its_twelve_month_term_with_an_exclusive_end_date()
    {
        var start = new DateOnly(2026, 1, 31);
        var lease = Lease.Issue(Guid.NewGuid(), Guid.NewGuid(), start, Now);

        Assert.Equal(new DateOnly(2027, 1, 31), lease.EndDate);
        Assert.False(lease.Covers(start.AddDays(-1)));
        Assert.True(lease.Covers(start));
        Assert.True(lease.Covers(new DateOnly(2027, 1, 30)));
        Assert.False(lease.Covers(lease.EndDate));
    }

    /// <summary>Unit types get their ids from the database; tests set them explicitly.</summary>
    private static UnitType WithId(UnitType type, int id)
    {
        typeof(UnitType).GetProperty(nameof(UnitType.Id))!.SetValue(type, id);
        return type;
    }
}
