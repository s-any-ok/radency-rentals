using Microsoft.EntityFrameworkCore;
using Radency.Rentals.Domain.Applications;
using Radency.Rentals.Domain.Common;
using Radency.Rentals.Domain.Leases;
using Radency.Rentals.Domain.Properties;

namespace Radency.Rentals.Application.Abstractions;

public interface IRentalsDbContext
{
    DbSet<Property> Properties { get; }

    DbSet<Unit> Units { get; }

    DbSet<UnitType> UnitTypes { get; }

    DbSet<RentalApplication> Applications { get; }

    DbSet<ApplicationStatusChange> ApplicationStatusChanges { get; }

    DbSet<ManagerNote> ManagerNotes { get; }

    DbSet<Lease> Leases { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Makes EF compare the stored version with the one the client sent, so a write
    /// that races with another one between our read and our update is still rejected.
    /// </summary>
    void SetOriginalVersion<TEntity>(TEntity entity, Guid version)
        where TEntity : class, IVersioned;
}
