namespace Radency.Rentals.Domain.Common;

/// <summary>The user performing an action, captured for audit history.</summary>
public sealed record Actor(Guid UserId, string Name);
