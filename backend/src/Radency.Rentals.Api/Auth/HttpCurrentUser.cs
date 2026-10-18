using System.Security.Claims;
using Radency.Rentals.Application.Abstractions;
using Radency.Rentals.Application.Common;
using Radency.Rentals.Infrastructure.Identity;

namespace Radency.Rentals.Api.Auth;

/// <summary>Reads the signed-in user from the bearer token's claims.</summary>
internal sealed class HttpCurrentUser(IHttpContextAccessor accessor) : ICurrentUser
{
    private ClaimsPrincipal Principal =>
        accessor.HttpContext?.User ?? throw new InvalidOperationException("No HTTP context.");

    public Guid UserId =>
        Guid.TryParse(Principal.FindFirstValue(ClaimTypes.NameIdentifier), out var id)
            ? id
            : throw new InvalidOperationException("The user is not authenticated.");

    public string Name =>
        Principal.FindFirstValue(AppClaimTypes.FullName)
        ?? Principal.Identity?.Name
        ?? "Unknown user";

    public bool IsPropertyManager => Principal.IsInRole(Roles.PropertyManager);

    public bool IsApplicant => Principal.IsInRole(Roles.Applicant);
}
