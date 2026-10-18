using Bogus;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Radency.Rentals.Application.Common;
using Radency.Rentals.Domain.Applications;
using Radency.Rentals.Domain.Common;
using Radency.Rentals.Domain.Properties;
using Radency.Rentals.Infrastructure.Identity;
using Radency.Rentals.Infrastructure.Persistence;

namespace Radency.Rentals.Infrastructure.Seeding;

/// <summary>
/// Idempotent demo data: every step checks what already exists, so running it on each start is safe.
/// Bogus uses a fixed seed, so a fresh database always gets the same data.
/// </summary>
public sealed class DatabaseSeeder(
    RentalsDbContext db,
    UserManager<ApplicationUser> userManager,
    RoleManager<IdentityRole<Guid>> roleManager,
    TimeProvider clock,
    ILogger<DatabaseSeeder> logger)
{
    public const string DemoPassword = "Radency123";

    private const int RandomSeed = 20261015;
    private const string LegacyUnitType = "Townhouse";

    private static readonly (string Name, bool IsActive)[] UnitTypeSeed =
    [
        ("Studio", true),
        ("Apartment", true),
        ("Loft", true),
        ("Duplex", true),
        (LegacyUnitType, false),
        ("Penthouse", false),
    ];

    private static readonly (string Email, string FullName)[] ManagerAccounts =
    [
        ("manager@radency.test", "Morgan Reyes"),
        ("manager2@radency.test", "Avery Collins"),
    ];

    private static readonly (string Email, string FullName)[] ApplicantAccounts =
    [
        ("applicant@radency.test", "Jordan Smith"),
        ("applicant2@radency.test", "Taylor Brooks"),
        ("applicant3@radency.test", "Casey Morgan"),
        ("applicant4@radency.test", "Riley Parker"),
    ];

    private static readonly string[] PropertySuffixes = ["Residences", "Apartments", "Lofts", "Commons", "Gardens", "Heights"];

    public async Task SeedAsync(CancellationToken ct = default)
    {
        var faker = new Faker("en") { Random = new Randomizer(RandomSeed) };

        await SeedRolesAsync();
        await SeedUnitTypesAsync(ct);
        var managers = await SeedUsersAsync(Roles.PropertyManager, ManagerAccounts);
        var applicants = await SeedUsersAsync(Roles.Applicant, ApplicantAccounts);

        if (!await db.Properties.AnyAsync(ct))
        {
            await SeedPropertiesAsync(faker, ct);
        }

        if (!await db.Applications.AnyAsync(ct))
        {
            await SeedApplicationsAsync(faker, managers, applicants, ct);
        }

        logger.LogInformation("Seed data is in place");
    }

    private async Task SeedRolesAsync()
    {
        foreach (var role in Roles.All)
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                EnsureSucceeded(await roleManager.CreateAsync(new IdentityRole<Guid>(role)), $"create role {role}");
            }
        }
    }

    private async Task SeedUnitTypesAsync(CancellationToken ct)
    {
        var existing = await db.UnitTypes.Select(t => t.Name).ToListAsync(ct);
        foreach (var (name, isActive) in UnitTypeSeed.Where(t => !existing.Contains(t.Name)))
        {
            db.UnitTypes.Add(new UnitType(name, isActive));
        }

        await db.SaveChangesAsync(ct);
    }

    private async Task<List<Actor>> SeedUsersAsync(string role, IEnumerable<(string Email, string FullName)> accounts)
    {
        var actors = new List<Actor>();

        foreach (var (email, fullName) in accounts)
        {
            var user = await userManager.FindByEmailAsync(email);
            if (user is null)
            {
                user = new ApplicationUser { UserName = email, Email = email, EmailConfirmed = true, FullName = fullName };
                EnsureSucceeded(await userManager.CreateAsync(user, DemoPassword), $"create user {email}");
            }

            if (!await userManager.IsInRoleAsync(user, role))
            {
                EnsureSucceeded(await userManager.AddToRoleAsync(user, role), $"add {email} to {role}");
            }

            actors.Add(new Actor(user.Id, user.FullName));
        }

        return actors;
    }

    private async Task SeedPropertiesAsync(Faker faker, CancellationToken ct)
    {
        var now = clock.GetUtcNow().UtcDateTime;
        var unitTypes = await db.UnitTypes.ToDictionaryAsync(t => t.Name, ct);
        var legacyType = unitTypes[LegacyUnitType];
        var activeTypes = new[] { unitTypes["Apartment"], unitTypes["Loft"], unitTypes["Duplex"] };

        // The legacy type was retired after some units were created with it. Re-enable it just
        // for seeding so the domain rule ("inactive types can't be selected") stays intact.
        legacyType.Activate();

        for (var p = 0; p < 6; p++)
        {
            var createdAt = now.AddDays(-faker.Random.Int(200, 400));
            var property = new Property(
                faker.Random.Guid(),
                $"{faker.Address.StreetName()} {PropertySuffixes[p % PropertySuffixes.Length]}",
                faker.Address.StreetAddress(),
                faker.Address.City(),
                createdAt);

            var unitCount = faker.Random.Int(4, 7);
            for (var u = 0; u < unitCount; u++)
            {
                var bedrooms = faker.Random.Int(0, 3);
                var unitType = p == 0 && u == 0
                    ? legacyType
                    : bedrooms == 0 ? unitTypes["Studio"] : faker.PickRandom(activeTypes);

                property.Units.Add(Unit.Create(
                    faker.Random.Guid(),
                    property.Id,
                    $"{u / 3 + 1}{u % 3 + 1:00}",
                    bedrooms,
                    900m + bedrooms * 450m + faker.Random.Int(0, 20) * 25m,
                    unitType,
                    createdAt));
            }

            db.Properties.Add(property);
        }

        await db.SaveChangesAsync(ct);

        legacyType.Deactivate();
        await db.SaveChangesAsync(ct);
    }

    private async Task SeedApplicationsAsync(Faker faker, List<Actor> managers, List<Actor> applicants, CancellationToken ct)
    {
        var now = clock.GetUtcNow().UtcDateTime;
        var units = await db.Units
            .Include(u => u.Property)
            .OrderBy(u => u.Property.Name)
            .ThenBy(u => u.UnitNumber)
            .ToListAsync(ct);

        var unitIndex = 0;
        Unit NextUnit() => units[unitIndex++ % units.Count];
        Actor NextApplicant() => applicants[unitIndex % applicants.Count];
        var manager = managers[0];

        var scenarios = new (ApplicationStatus Status, int DaysAgo)[]
        {
            (ApplicationStatus.Draft, 2),
            (ApplicationStatus.Draft, 5),
            (ApplicationStatus.Submitted, 3),
            (ApplicationStatus.Submitted, 6),
            (ApplicationStatus.Submitted, 9),
            (ApplicationStatus.Returned, 8),
            (ApplicationStatus.Returned, 12),
            (ApplicationStatus.Approved, 20),
            (ApplicationStatus.Approved, 45),
            (ApplicationStatus.Denied, 15),
            (ApplicationStatus.Denied, 30),
            (ApplicationStatus.Withdrawn, 10),
            (ApplicationStatus.Withdrawn, 25),
        };

        Unit? leasedUnit = null;

        foreach (var (status, daysAgo) in scenarios)
        {
            var unit = NextUnit();
            var application = BuildApplication(faker, status, unit, NextApplicant(), manager, now.AddDays(-daysAgo), fillForm: daysAgo > 2);
            db.Applications.Add(application);

            if (status == ApplicationStatus.Approved)
            {
                leasedUnit ??= unit;
            }
        }

        // An open application on a unit that now has an active lease: approving it is rejected,
        // which demonstrates the "no second lease" rule.
        if (leasedUnit is not null)
        {
            db.Applications.Add(BuildApplication(
                faker,
                ApplicationStatus.Submitted,
                leasedUnit,
                applicants[^1],
                manager,
                now.AddDays(-22),
                fillForm: true));
        }

        await db.SaveChangesAsync(ct);
    }

    private static RentalApplication BuildApplication(
        Faker faker,
        ApplicationStatus targetStatus,
        Unit unit,
        Actor applicant,
        Actor manager,
        DateTime startedAt,
        bool fillForm)
    {
        var application = RentalApplication.Start(faker.Random.Guid(), unit.Id, applicant, startedAt);

        if (targetStatus == ApplicationStatus.Draft && !fillForm)
        {
            return application;
        }

        application.SaveApplicantInfo(
            new ApplicantInfo(
                applicant.Name,
                faker.Phone.PhoneNumber("(###) ###-####"),
                $"{applicant.Name.Split(' ')[0].ToLowerInvariant()}@example.com",
                faker.Address.FullAddress()),
            startedAt.AddMinutes(10));

        if (targetStatus == ApplicationStatus.Draft)
        {
            return application;
        }

        application.SaveResidenceHistory(FakeResidences(faker, DateOnly.FromDateTime(startedAt)), startedAt.AddMinutes(20));
        application.Submit(unitHasActiveLease: false, applicant, startedAt.AddMinutes(30));

        var decidedAt = startedAt.AddDays(1);
        switch (targetStatus)
        {
            case ApplicationStatus.Returned:
                application.Review(
                    ReviewOutcome.Return,
                    "Please add the landlord phone number for your previous residence.",
                    unitHasActiveLease: false,
                    manager,
                    DateOnly.FromDateTime(decidedAt),
                    decidedAt);
                break;

            case ApplicationStatus.Approved:
                application.Review(
                    ReviewOutcome.Approve,
                    "Welcome! Keys are available at the front office.",
                    unitHasActiveLease: false,
                    manager,
                    DateOnly.FromDateTime(decidedAt),
                    decidedAt);
                break;

            case ApplicationStatus.Denied:
                application.Review(
                    ReviewOutcome.Deny,
                    "Rental history could not be verified with the previous landlord.",
                    unitHasActiveLease: false,
                    manager,
                    DateOnly.FromDateTime(decidedAt),
                    decidedAt);
                break;

            case ApplicationStatus.Withdrawn:
                application.Withdraw(applicant, decidedAt);
                break;
        }

        return application;
    }

    private static List<Residence> FakeResidences(Faker faker, DateOnly before)
    {
        var residences = new List<Residence>();
        var moveOut = before.AddMonths(-faker.Random.Int(1, 3));

        var count = faker.Random.Int(1, 3);

        for (var i = 0; i < count; i++)
        {
            var moveIn = moveOut.AddMonths(-faker.Random.Int(12, 36));
            residences.Add(new Residence(
                faker.Address.FullAddress(),
                faker.Name.FullName(),
                faker.Phone.PhoneNumber("(###) ###-####"),
                moveIn,
                moveOut));
            moveOut = moveIn.AddDays(-faker.Random.Int(1, 20));
        }

        return residences;
    }

    private static void EnsureSucceeded(IdentityResult result, string action)
    {
        if (!result.Succeeded)
        {
            throw new InvalidOperationException(
                $"Seeding failed to {action}: {string.Join("; ", result.Errors.Select(e => e.Description))}");
        }
    }
}
