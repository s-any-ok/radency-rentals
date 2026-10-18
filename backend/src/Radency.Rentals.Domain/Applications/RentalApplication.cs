using Radency.Rentals.Domain.Common;
using Radency.Rentals.Domain.Leases;
using Radency.Rentals.Domain.Properties;

namespace Radency.Rentals.Domain.Applications;

/// <summary>
/// Rental application aggregate. Owns the status state machine:
/// <code>
/// Draft ──submit──► Submitted ──approve──► Approved (lease issued)
///   │                 │  ▲      ──deny─────► Denied
///   │                 │  └resubmit─ Returned ◄──return──┘
///   └──────withdraw───┴──────────────┴──► Withdrawn
/// </code>
/// Approved, Denied and Withdrawn are terminal.
/// </summary>
public sealed class RentalApplication : IVersioned
{
    private RentalApplication()
    {
    }

    public Guid Id { get; private set; }

    public Guid UnitId { get; private set; }

    public Unit Unit { get; private set; } = null!;

    public Guid ApplicantId { get; private set; }

    /// <summary>Snapshot of the applicant's account name, used in lists before the form is filled.</summary>
    public string ApplicantName { get; private set; } = string.Empty;

    public ApplicationStatus Status { get; private set; }

    public ApplicantInfo? ApplicantInfo { get; private set; }

    public List<Residence> Residences { get; private set; } = [];

    public bool ApplicantInfoCompleted { get; private set; }

    public bool ResidenceHistoryCompleted { get; private set; }

    public List<ApplicationStatusChange> History { get; private set; } = [];

    public Lease? Lease { get; private set; }

    /// <summary>The comment of the latest review, shown to the applicant (e.g. what to fix after a Return).</summary>
    public string? LastReviewComment { get; private set; }

    public DateTime CreatedAt { get; private set; }

    public DateTime UpdatedAt { get; private set; }

    public DateTime? SubmittedAt { get; private set; }

    public DateTime? DecidedAt { get; private set; }

    public Guid Version { get; set; }

    public bool IsTerminal => Status is ApplicationStatus.Approved or ApplicationStatus.Denied or ApplicationStatus.Withdrawn;

    /// <summary>The applicant may edit sections only while the application is a Draft or was Returned.</summary>
    public bool IsEditableByApplicant => Status is ApplicationStatus.Draft or ApplicationStatus.Returned;

    public bool CanSubmit => IsEditableByApplicant && ApplicantInfoCompleted && ResidenceHistoryCompleted;

    public bool CanWithdraw => !IsTerminal;

    public bool CanReview => Status == ApplicationStatus.Submitted;

    public static RentalApplication Start(Guid id, Guid unitId, Actor applicant, DateTime now)
    {
        var application = new RentalApplication
        {
            Id = id,
            UnitId = unitId,
            ApplicantId = applicant.UserId,
            ApplicantName = applicant.Name,
            Status = ApplicationStatus.Draft,
            CreatedAt = now,
            UpdatedAt = now,
        };
        application.History.Add(ApplicationStatusChange.Record(id, null, ApplicationStatus.Draft, applicant, now));
        return application;
    }

    public void SaveApplicantInfo(ApplicantInfo info, DateTime now)
    {
        EnsureEditable();
        ApplicantInfo = info;
        ApplicantInfoCompleted = true;
        UpdatedAt = now;
    }

    public void SaveResidenceHistory(IEnumerable<Residence> residences, DateTime now)
    {
        EnsureEditable();
        Residences = residences.ToList();
        ResidenceHistoryCompleted = true;
        UpdatedAt = now;
    }

    public void Submit(bool unitHasActiveLease, Actor actor, DateTime now)
    {
        EnsureEditable();

        if (!ApplicantInfoCompleted || !ResidenceHistoryCompleted)
        {
            throw new BusinessRuleException(
                ErrorCodes.ApplicationIncomplete,
                "Both sections must be saved before the application can be submitted.");
        }

        EnsureNoActiveLease(unitHasActiveLease);

        TransitionTo(ApplicationStatus.Submitted, actor, now);
        SubmittedAt = now;
    }

    public void Withdraw(Actor actor, DateTime now)
    {
        if (!CanWithdraw)
        {
            throw InvalidTransition(ApplicationStatus.Withdrawn);
        }

        TransitionTo(ApplicationStatus.Withdrawn, actor, now);
        DecidedAt = now;
    }

    /// <summary>Completes a review. Returns the issued lease when the outcome is Approve.</summary>
    public Lease? Review(
        ReviewOutcome outcome,
        string? comment,
        bool unitHasActiveLease,
        Actor reviewer,
        DateOnly today,
        DateTime now)
    {
        if (!CanReview)
        {
            throw new BusinessRuleException(
                ErrorCodes.InvalidStatusTransition,
                $"Only submitted applications can be reviewed (current status: {Status}).");
        }

        if (outcome is ReviewOutcome.Return or ReviewOutcome.Deny && string.IsNullOrWhiteSpace(comment))
        {
            throw new BusinessRuleException(
                ErrorCodes.ReviewCommentRequired,
                "A comment is required when returning or denying an application.");
        }

        LastReviewComment = string.IsNullOrWhiteSpace(comment) ? null : comment.Trim();

        switch (outcome)
        {
            case ReviewOutcome.Approve:
                EnsureNoActiveLease(unitHasActiveLease);
                TransitionTo(ApplicationStatus.Approved, reviewer, now, outcome, comment);
                DecidedAt = now;
                var lease = Leases.Lease.Issue(UnitId, Id, today, now);
                Lease = lease;
                return lease;

            case ReviewOutcome.Return:
                TransitionTo(ApplicationStatus.Returned, reviewer, now, outcome, comment);
                return null;

            case ReviewOutcome.Deny:
                TransitionTo(ApplicationStatus.Denied, reviewer, now, outcome, comment);
                DecidedAt = now;
                return null;

            default:
                throw new ArgumentOutOfRangeException(nameof(outcome), outcome, null);
        }
    }

    private void EnsureEditable()
    {
        if (!IsEditableByApplicant)
        {
            throw new BusinessRuleException(
                ErrorCodes.ApplicationNotEditable,
                $"The application can't be changed while it is {Status}.");
        }
    }

    private static void EnsureNoActiveLease(bool unitHasActiveLease)
    {
        if (unitHasActiveLease)
        {
            throw new BusinessRuleException(
                ErrorCodes.UnitHasActiveLease,
                "This unit already has an active lease.");
        }
    }

    private BusinessRuleException InvalidTransition(ApplicationStatus target) =>
        new(ErrorCodes.InvalidStatusTransition, $"An application can't move from {Status} to {target}.");

    private void TransitionTo(
        ApplicationStatus target,
        Actor actor,
        DateTime now,
        ReviewOutcome? outcome = null,
        string? comment = null)
    {
        History.Add(ApplicationStatusChange.Record(Id, Status, target, actor, now, outcome, comment));
        Status = target;
        UpdatedAt = now;
    }
}
