using Radency.Rentals.Domain.Common;

namespace Radency.Rentals.Application.Common;

/// <summary>Input failed validation. Errors are keyed by camelCase field path (e.g. "residences[0].moveOutDate").</summary>
public sealed class RequestValidationException(IDictionary<string, string[]> errors)
    : DomainException(ErrorCodes.ValidationFailed, "One or more fields are invalid.")
{
    public IDictionary<string, string[]> Errors { get; } = errors;

    public static RequestValidationException For(string field, string message) =>
        new(new Dictionary<string, string[]> { [field] = [message] });
}
