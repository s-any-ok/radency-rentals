using Radency.Rentals.Application.Abstractions;

namespace Radency.Rentals.UnitTests.Support;

public sealed class FixedClock(DateTimeOffset now) : TimeProvider
{
    public DateTimeOffset Now { get; set; } = now;

    public DateTime UtcNow => Now.UtcDateTime;

    public override DateTimeOffset GetUtcNow() => Now;
}

public sealed class TestUser : ICurrentUser
{
    private TestUser(string name, bool isManager)
    {
        Name = name;
        IsPropertyManager = isManager;
        IsApplicant = !isManager;
    }

    public Guid UserId { get; } = Guid.NewGuid();

    public string Name { get; }

    public bool IsPropertyManager { get; }

    public bool IsApplicant { get; }

    public static TestUser Applicant(string name = "Jordan Smith") => new(name, isManager: false);

    public static TestUser Manager(string name = "Morgan Reyes") => new(name, isManager: true);
}
