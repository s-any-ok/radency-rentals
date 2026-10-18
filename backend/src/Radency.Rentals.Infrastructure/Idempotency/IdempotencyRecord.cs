namespace Radency.Rentals.Infrastructure.Idempotency;

/// <summary>
/// The stored outcome of a mutating request sent with an Idempotency-Key header.
/// A replay of the same key by the same user returns this response instead of running the action again.
/// </summary>
public sealed class IdempotencyRecord
{
    public Guid UserId { get; set; }

    public string Key { get; set; } = string.Empty;

    public string Method { get; set; } = string.Empty;

    public string Path { get; set; } = string.Empty;

    public int StatusCode { get; set; }

    public string? ResponseBody { get; set; }

    public DateTime CreatedAt { get; set; }
}
