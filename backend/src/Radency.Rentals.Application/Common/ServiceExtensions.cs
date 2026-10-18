using Radency.Rentals.Application.Abstractions;
using Radency.Rentals.Domain.Common;

namespace Radency.Rentals.Application.Common;

internal static class ServiceExtensions
{
    public static DateTime UtcNow(this TimeProvider clock) => clock.GetUtcNow().UtcDateTime;

    public static DateOnly Today(this TimeProvider clock) => DateOnly.FromDateTime(clock.GetUtcNow().UtcDateTime);

    /// <summary>
    /// Rejects stale writes up front and also pins the original value so EF's
    /// concurrency check covers the window between our read and our update.
    /// </summary>
    public static void EnsureVersion<TEntity>(this IRentalsDbContext db, TEntity entity, Guid clientVersion)
        where TEntity : class, IVersioned
    {
        if (entity.Version != clientVersion)
        {
            throw new ConcurrencyException();
        }

        db.SetOriginalVersion(entity, clientVersion);
    }

    public static void EnsurePropertyManager(this ICurrentUser user)
    {
        if (!user.IsPropertyManager)
        {
            throw new ForbiddenException("Only property managers can perform this action.");
        }
    }

    public static void EnsureApplicant(this ICurrentUser user)
    {
        if (!user.IsApplicant)
        {
            throw new ForbiddenException("Only applicants can perform this action.");
        }
    }
}
