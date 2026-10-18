using Radency.Rentals.Domain.Common;

namespace Radency.Rentals.Domain.Applications;

/// <summary>Audit entry: who moved the application between statuses, when, and why.</summary>
public sealed class ApplicationStatusChange
{
    private ApplicationStatusChange()
    {
    }

    public Guid Id { get; private set; }

    public Guid ApplicationId { get; private set; }

    public ApplicationStatus? FromStatus { get; private set; }

    public ApplicationStatus ToStatus { get; private set; }

    public ReviewOutcome? Outcome { get; private set; }

    public string? Comment { get; private set; }

    public Guid ChangedById { get; private set; }

    public string ChangedByName { get; private set; } = string.Empty;

    public DateTime ChangedAt { get; private set; }

    internal static ApplicationStatusChange Record(
        Guid applicationId,
        ApplicationStatus? from,
        ApplicationStatus to,
        Actor actor,
        DateTime now,
        ReviewOutcome? outcome = null,
        string? comment = null) =>
        new()
        {
            Id = Guid.NewGuid(),
            ApplicationId = applicationId,
            FromStatus = from,
            ToStatus = to,
            Outcome = outcome,
            Comment = string.IsNullOrWhiteSpace(comment) ? null : comment.Trim(),
            ChangedById = actor.UserId,
            ChangedByName = actor.Name,
            ChangedAt = now,
        };
}
