using FluentValidation;
using FluentValidation.Results;

namespace Radency.Rentals.Application.Common;

public static class ValidationExtensions
{
    /// <summary>
    /// Validates the instance and throws <see cref="RequestValidationException"/> with errors
    /// keyed by camelCase paths so clients can attach each message to the field it belongs to.
    /// </summary>
    public static async Task EnsureValidAsync<T>(
        this IValidator<T> validator,
        T instance,
        string? prefix = null,
        CancellationToken cancellationToken = default)
    {
        var result = await validator.ValidateAsync(instance, cancellationToken);
        if (!result.IsValid)
        {
            throw new RequestValidationException(ToErrorDictionary(result, prefix));
        }
    }

    public static Dictionary<string, string[]> ToErrorDictionary(ValidationResult result, string? prefix = null) =>
        result.Errors
            .GroupBy(e => ToFieldPath(e.PropertyName, prefix))
            .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).Distinct().ToArray());

    /// <summary>"Residences[0].MoveOutDate" → "residences[0].moveOutDate" (optionally prefixed).</summary>
    public static string ToFieldPath(string propertyName, string? prefix = null)
    {
        var camel = string.Join('.', propertyName.Split('.').Select(ToCamelCase));
        if (string.IsNullOrEmpty(prefix))
        {
            return camel;
        }

        return string.IsNullOrEmpty(camel) ? prefix : $"{prefix}.{camel}";
    }

    private static string ToCamelCase(string segment) =>
        string.IsNullOrEmpty(segment) || char.IsLower(segment[0])
            ? segment
            : char.ToLowerInvariant(segment[0]) + segment[1..];
}
