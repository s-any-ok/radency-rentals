namespace Radency.Rentals.Domain.Applications;

public enum ApplicationStatus
{
    Draft,
    Submitted,
    Returned,
    Approved,
    Denied,
    Withdrawn,
}

public enum ReviewOutcome
{
    Approve,
    Return,
    Deny,
}

public enum ApplicationSection
{
    ApplicantInformation,
    ResidenceHistory,
}
