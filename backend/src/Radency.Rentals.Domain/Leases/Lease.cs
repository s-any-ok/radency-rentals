namespace Radency.Rentals.Domain.Leases;

/// <summary>A lease issued when an application is approved. The term end date is exclusive.</summary>
public sealed class Lease
{
    public const int TermMonths = 12;

    private Lease()
    {
    }

    public Guid Id { get; private set; }

    public Guid UnitId { get; private set; }

    public Guid ApplicationId { get; private set; }

    public DateOnly StartDate { get; private set; }

    public DateOnly EndDate { get; private set; }

    public DateTime CreatedAt { get; private set; }

    public static Lease Issue(Guid unitId, Guid applicationId, DateOnly startDate, DateTime now) =>
        new()
        {
            Id = Guid.NewGuid(),
            UnitId = unitId,
            ApplicationId = applicationId,
            StartDate = startDate,
            EndDate = startDate.AddMonths(TermMonths),
            CreatedAt = now,
        };

    /// <summary>True when the lease term covers the given date.</summary>
    public bool Covers(DateOnly date) => StartDate <= date && date < EndDate;
}
