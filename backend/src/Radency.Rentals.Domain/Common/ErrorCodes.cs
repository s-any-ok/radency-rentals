namespace Radency.Rentals.Domain.Common;

/// <summary>Stable error codes returned to clients in the ProblemDetails "code" extension.</summary>
public static class ErrorCodes
{
    public const string NotFound = "not_found";
    public const string Forbidden = "forbidden";
    public const string ValidationFailed = "validation_failed";
    public const string ConcurrencyConflict = "concurrency_conflict";
    public const string DuplicateId = "duplicate_id";

    public const string UnitTypeInactive = "unit_type_inactive";
    public const string UnitNumberTaken = "unit_number_taken";
    public const string UnitNotAvailable = "unit_not_available";
    public const string UnitInUse = "unit_in_use";
    public const string PropertyInUse = "property_in_use";

    public const string ApplicationNotEditable = "application_not_editable";
    public const string ApplicationIncomplete = "application_incomplete";
    public const string InvalidStatusTransition = "invalid_status_transition";
    public const string ReviewCommentRequired = "review_comment_required";
    public const string UnitHasActiveLease = "unit_has_active_lease";
}
