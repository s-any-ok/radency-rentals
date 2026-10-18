using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Radency.Rentals.Application.Abstractions;
using Radency.Rentals.Domain.Applications;
using Radency.Rentals.Domain.Common;
using Radency.Rentals.Domain.Leases;
using Radency.Rentals.Domain.Properties;
using Radency.Rentals.Infrastructure.Idempotency;
using Radency.Rentals.Infrastructure.Identity;

namespace Radency.Rentals.Infrastructure.Persistence;

public sealed class RentalsDbContext(DbContextOptions<RentalsDbContext> options)
    : IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid>(options), IRentalsDbContext
{
    public DbSet<Property> Properties => Set<Property>();

    public DbSet<Unit> Units => Set<Unit>();

    public DbSet<UnitType> UnitTypes => Set<UnitType>();

    public DbSet<RentalApplication> Applications => Set<RentalApplication>();

    public DbSet<ApplicationStatusChange> ApplicationStatusChanges => Set<ApplicationStatusChange>();

    public DbSet<ManagerNote> ManagerNotes => Set<ManagerNote>();

    public DbSet<Lease> Leases => Set<Lease>();

    public DbSet<IdempotencyRecord> IdempotencyRecords => Set<IdempotencyRecord>();

    public void SetOriginalVersion<TEntity>(TEntity entity, Guid version)
        where TEntity : class, IVersioned =>
        Entry(entity).Property(e => e.Version).OriginalValue = version;

    public override int SaveChanges(bool acceptAllChangesOnSuccess)
    {
        StampVersions();
        return base.SaveChanges(acceptAllChangesOnSuccess);
    }

    public override Task<int> SaveChangesAsync(bool acceptAllChangesOnSuccess, CancellationToken cancellationToken = default)
    {
        StampVersions();
        return base.SaveChangesAsync(acceptAllChangesOnSuccess, cancellationToken);
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        builder.ApplyConfigurationsFromAssembly(typeof(RentalsDbContext).Assembly);
    }

    protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder)
    {
        // Every timestamp is stored in UTC; make sure it comes back marked as UTC too.
        // (The API's JSON converter also treats unspecified kinds as UTC as a second line of defense.)
        configurationBuilder.Properties<DateTime>().HaveConversion<UtcDateTimeConverter>();
    }

    /// <summary>
    /// Application-managed concurrency token: a new GUID on every insert/update. Unlike SQL Server's
    /// rowversion it behaves the same on every provider, which keeps the rule testable.
    /// </summary>
    private void StampVersions()
    {
        foreach (var entry in ChangeTracker.Entries<IVersioned>())
        {
            if (entry.State is EntityState.Added or EntityState.Modified)
            {
                entry.Entity.Version = Guid.NewGuid();
            }
        }
    }
}
