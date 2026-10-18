using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Radency.Rentals.Infrastructure.Persistence;

namespace Radency.Rentals.Infrastructure.Seeding;

/// <summary>Runs on startup: creates the database, applies migrations, then seeds idempotently.</summary>
public sealed class DatabaseInitializer(
    RentalsDbContext db,
    DatabaseSeeder seeder,
    ILogger<DatabaseInitializer> logger)
{
    private const int MaxAttempts = 10;
    private static readonly TimeSpan RetryDelay = TimeSpan.FromSeconds(3);

    public async Task InitializeAsync(CancellationToken ct = default)
    {
        await WaitForDatabaseAsync(ct);
        await seeder.SeedAsync(ct);
    }

    /// <summary>
    /// SQL Server in Docker can take a few seconds to accept connections after the container starts,
    /// so the first migration attempt is retried.
    /// </summary>
    private async Task WaitForDatabaseAsync(CancellationToken ct)
    {
        for (var attempt = 1; ; attempt++)
        {
            try
            {
                if (db.Database.IsSqlServer())
                {
                    // Creates the database when it doesn't exist and applies pending migrations.
                    await db.Database.MigrateAsync(ct);
                }
                else
                {
                    // Non-SQL Server providers (SQLite in tests) build the schema from the model.
                    await db.Database.EnsureCreatedAsync(ct);
                }

                logger.LogInformation("Database is up to date");
                return;
            }
            catch (Exception ex) when (attempt < MaxAttempts && !ct.IsCancellationRequested)
            {
                logger.LogWarning(ex, "Database not ready (attempt {Attempt}/{MaxAttempts}), retrying", attempt, MaxAttempts);
                await Task.Delay(RetryDelay, ct);
            }
        }
    }
}
