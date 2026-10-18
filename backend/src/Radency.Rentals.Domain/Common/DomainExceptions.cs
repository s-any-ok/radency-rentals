namespace Radency.Rentals.Domain.Common;

/// <summary>Base type for expected, user-facing failures. Each one carries a stable machine-readable code.</summary>
public abstract class DomainException(string code, string message) : Exception(message)
{
    public string Code { get; } = code;
}

/// <summary>A business rule rejected the action (e.g. the unit already has an active lease).</summary>
public sealed class BusinessRuleException(string code, string message) : DomainException(code, message);

public sealed class NotFoundException(string entityName, object key)
    : DomainException(ErrorCodes.NotFound, $"{entityName} '{key}' was not found.");

public sealed class ForbiddenException(string message = "You are not allowed to perform this action.")
    : DomainException(ErrorCodes.Forbidden, message);

/// <summary>The client sent a stale version of an aggregate.</summary>
public sealed class ConcurrencyException()
    : DomainException(
        ErrorCodes.ConcurrencyConflict,
        "This record was changed by someone else. Reload it and try again.");
