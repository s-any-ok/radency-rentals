using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Radency.Rentals.Application.Abstractions;
using Radency.Rentals.Application.Applications;
using Radency.Rentals.Application.Units;
using Radency.Rentals.Domain.Properties;
using Radency.Rentals.Infrastructure.Persistence;

namespace Radency.Rentals.UnitTests.Support;

/// <summary>
/// A real relational database (SQLite in memory) so query translation, concurrency tokens and
/// constraints behave like they do in production rather than being mocked away.
/// </summary>
public sealed class TestDatabase : IDisposable
{
    private readonly SqliteConnection _connection;
    private readonly DbContextOptions<RentalsDbContext> _options;

    public TestDatabase()
    {
        _connection = new SqliteConnection("DataSource=:memory:");
        _connection.Open();
        _options = new DbContextOptionsBuilder<RentalsDbContext>().UseSqlite(_connection).Options;

        using var context = CreateContext();
        context.Database.EnsureCreated();
    }

    public FixedClock Clock { get; } = new(new DateTimeOffset(2026, 10, 15, 12, 0, 0, TimeSpan.Zero));

    public RentalsDbContext CreateContext() => new(_options);

    public ApplicationService Applications(RentalsDbContext context, ICurrentUser user) =>
        new(
            context,
            user,
            Clock,
            new ApplicantInfoValidator(),
            new ResidenceHistoryValidator(new ResidenceValidator(Clock)),
            new ReviewApplicationRequestValidator(),
            new UpdateManagerNoteRequestValidator());

    public UnitService Units(RentalsDbContext context, ICurrentUser user) =>
        new(context, user, Clock, new CreateUnitRequestValidator(), new UpdateUnitRequestValidator());

    /// <summary>Adds one property with the given number of units and returns the unit ids.</summary>
    public async Task<IReadOnlyList<Guid>> SeedUnitsAsync(int count = 2)
    {
        await using var context = CreateContext();
        var type = await context.UnitTypes.FirstOrDefaultAsync(t => t.Name == "Apartment");
        if (type is null)
        {
            type = new UnitType("Apartment");
            context.UnitTypes.Add(type);
        }

        var property = new Property(Guid.NewGuid(), "Elm Residences", "1 Elm St", "Springfield", Clock.UtcNow);

        var ids = new List<Guid>();
        for (var i = 0; i < count; i++)
        {
            var unit = Unit.Create(Guid.NewGuid(), property.Id, $"10{i + 1}", 1, 1200m, type, Clock.UtcNow);
            property.Units.Add(unit);
            ids.Add(unit.Id);
        }

        context.Properties.Add(property);
        await context.SaveChangesAsync();
        return ids;
    }

    public void Dispose() => _connection.Dispose();
}
