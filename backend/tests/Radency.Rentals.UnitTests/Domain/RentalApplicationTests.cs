using Radency.Rentals.Domain.Applications;
using Radency.Rentals.Domain.Common;

namespace Radency.Rentals.UnitTests.Domain;

public sealed class RentalApplicationTests
{
    private static readonly DateTime Now = new(2026, 10, 15, 12, 0, 0, DateTimeKind.Utc);
    private static readonly DateOnly Today = DateOnly.FromDateTime(Now);
    private static readonly Actor Applicant = new(Guid.NewGuid(), "Jordan Smith");
    private static readonly Actor Manager = new(Guid.NewGuid(), "Morgan Reyes");

    [Fact]
    public void Start_creates_a_draft_and_records_it_in_history()
    {
        var application = NewDraft();

        Assert.Equal(ApplicationStatus.Draft, application.Status);
        Assert.True(application.IsEditableByApplicant);
        Assert.False(application.CanSubmit);
        var entry = Assert.Single(application.History);
        Assert.Null(entry.FromStatus);
        Assert.Equal(ApplicationStatus.Draft, entry.ToStatus);
        Assert.Equal(Applicant.Name, entry.ChangedByName);
    }

    [Fact]
    public void Submit_requires_both_sections_to_be_saved()
    {
        var application = NewDraft();
        application.SaveApplicantInfo(Info(), Now);

        var error = Assert.Throws<BusinessRuleException>(() => application.Submit(false, Applicant, Now));

        Assert.Equal(ErrorCodes.ApplicationIncomplete, error.Code);
        Assert.Equal(ApplicationStatus.Draft, application.Status);
    }

    [Fact]
    public void Submit_moves_a_complete_draft_to_submitted_and_locks_editing()
    {
        var application = CompleteDraft();

        application.Submit(unitHasActiveLease: false, Applicant, Now);

        Assert.Equal(ApplicationStatus.Submitted, application.Status);
        Assert.Equal(Now, application.SubmittedAt);
        Assert.False(application.IsEditableByApplicant);
        Assert.Throws<BusinessRuleException>(() => application.SaveApplicantInfo(Info(), Now));
    }

    [Fact]
    public void Submit_is_rejected_when_the_unit_has_an_active_lease()
    {
        var application = CompleteDraft();

        var error = Assert.Throws<BusinessRuleException>(() => application.Submit(unitHasActiveLease: true, Applicant, Now));

        Assert.Equal(ErrorCodes.UnitHasActiveLease, error.Code);
        Assert.Equal(ApplicationStatus.Draft, application.Status);
    }

    [Theory]
    [InlineData(ReviewOutcome.Return, null)]
    [InlineData(ReviewOutcome.Return, "   ")]
    [InlineData(ReviewOutcome.Deny, "")]
    public void Return_and_deny_require_a_comment(ReviewOutcome outcome, string? comment)
    {
        var application = Submitted();

        var error = Assert.Throws<BusinessRuleException>(
            () => application.Review(outcome, comment, false, Manager, Today, Now));

        Assert.Equal(ErrorCodes.ReviewCommentRequired, error.Code);
        Assert.Equal(ApplicationStatus.Submitted, application.Status);
    }

    [Fact]
    public void Approve_issues_a_twelve_month_lease_starting_today()
    {
        var application = Submitted();

        var lease = application.Review(ReviewOutcome.Approve, null, false, Manager, Today, Now);

        Assert.NotNull(lease);
        Assert.Equal(ApplicationStatus.Approved, application.Status);
        Assert.Equal(Today, lease.StartDate);
        Assert.Equal(Today.AddMonths(12), lease.EndDate);
        Assert.Equal(application.UnitId, lease.UnitId);
        Assert.Same(lease, application.Lease);
        Assert.True(application.IsTerminal);
    }

    [Fact]
    public void Approve_is_rejected_when_the_unit_already_has_an_active_lease()
    {
        var application = Submitted();

        var error = Assert.Throws<BusinessRuleException>(
            () => application.Review(ReviewOutcome.Approve, null, unitHasActiveLease: true, Manager, Today, Now));

        Assert.Equal(ErrorCodes.UnitHasActiveLease, error.Code);
        Assert.Equal(ApplicationStatus.Submitted, application.Status);
        Assert.Null(application.Lease);
    }

    [Fact]
    public void Returned_application_can_be_corrected_and_resubmitted()
    {
        var application = Submitted();
        application.Review(ReviewOutcome.Return, "Add your landlord's phone.", false, Manager, Today, Now);

        Assert.Equal(ApplicationStatus.Returned, application.Status);
        Assert.True(application.IsEditableByApplicant);

        application.SaveApplicantInfo(Info("+1 555 000 1111"), Now.AddHours(1));
        application.Submit(false, Applicant, Now.AddHours(2));

        Assert.Equal(ApplicationStatus.Submitted, application.Status);
        Assert.Equal(
            new[] { ApplicationStatus.Draft, ApplicationStatus.Submitted, ApplicationStatus.Returned, ApplicationStatus.Submitted },
            application.History.Select(h => h.ToStatus));
        Assert.Equal("Add your landlord's phone.", application.History[2].Comment);
        Assert.Equal(Manager.Name, application.History[2].ChangedByName);
    }

    [Theory]
    [InlineData(ReviewOutcome.Approve)]
    [InlineData(ReviewOutcome.Deny)]
    public void Terminal_applications_cannot_be_withdrawn_or_reviewed_again(ReviewOutcome outcome)
    {
        var application = Submitted();
        application.Review(outcome, "Decision", false, Manager, Today, Now);

        Assert.Throws<BusinessRuleException>(() => application.Withdraw(Applicant, Now));
        Assert.Throws<BusinessRuleException>(() => application.Review(ReviewOutcome.Approve, null, false, Manager, Today, Now));
    }

    [Fact]
    public void Draft_can_be_withdrawn_and_then_nothing_else_is_allowed()
    {
        var application = NewDraft();

        application.Withdraw(Applicant, Now);

        Assert.Equal(ApplicationStatus.Withdrawn, application.Status);
        Assert.False(application.IsEditableByApplicant);
        Assert.Throws<BusinessRuleException>(() => application.SaveApplicantInfo(Info(), Now));
        Assert.Throws<BusinessRuleException>(() => application.Withdraw(Applicant, Now));
    }

    [Fact]
    public void Draft_cannot_be_reviewed()
    {
        var application = CompleteDraft();

        var error = Assert.Throws<BusinessRuleException>(
            () => application.Review(ReviewOutcome.Approve, null, false, Manager, Today, Now));

        Assert.Equal(ErrorCodes.InvalidStatusTransition, error.Code);
    }

    private static RentalApplication NewDraft() =>
        RentalApplication.Start(Guid.NewGuid(), Guid.NewGuid(), Applicant, Now);

    private static RentalApplication CompleteDraft()
    {
        var application = NewDraft();
        application.SaveApplicantInfo(Info(), Now);
        application.SaveResidenceHistory(
            [new Residence("1 Main St", "Pat Lee", "+1 555 123 4567", Today.AddYears(-3), Today.AddMonths(-1))],
            Now);
        return application;
    }

    private static RentalApplication Submitted()
    {
        var application = CompleteDraft();
        application.Submit(false, Applicant, Now);
        return application;
    }

    private static ApplicantInfo Info(string phone = "+1 555 987 6543") =>
        new("Jordan Smith", phone, "jordan@example.com", "10 Elm St, Springfield");
}
