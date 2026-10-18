using Radency.Rentals.Domain.Common;

namespace Radency.Rentals.Domain.Applications;

/// <summary>
/// Internal property-manager notes for an application. Stored separately from the
/// application aggregate so it can never be serialized to an applicant by accident and
/// so manager edits don't bump the application's concurrency version.
/// </summary>
public sealed class ManagerNote : IVersioned
{
    private ManagerNote()
    {
    }

    public ManagerNote(Guid applicationId, string text, Actor author, DateTime now)
    {
        ApplicationId = applicationId;
        Update(text, author, now);
    }

    public Guid ApplicationId { get; private set; }

    public string Text { get; private set; } = string.Empty;

    public string UpdatedByName { get; private set; } = string.Empty;

    public DateTime UpdatedAt { get; private set; }

    public Guid Version { get; set; }

    public void Update(string text, Actor author, DateTime now)
    {
        Text = text.Trim();
        UpdatedByName = author.Name;
        UpdatedAt = now;
    }
}
