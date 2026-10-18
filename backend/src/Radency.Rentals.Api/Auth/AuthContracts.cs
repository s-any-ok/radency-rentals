using System.ComponentModel.DataAnnotations;

namespace Radency.Rentals.Api.Auth;

public enum UserRole
{
    Applicant,
    PropertyManager,
}

public sealed record RegisterRequest(
    [Required, EmailAddress, MaxLength(254)] string Email,
    [Required, MinLength(8), MaxLength(100)] string Password,
    [Required, MaxLength(200)] string FullName,
    UserRole Role);

public sealed record LoginRequest(
    [Required, EmailAddress] string Email,
    [Required] string Password);

public sealed record RefreshRequest([Required] string RefreshToken);

public sealed record CurrentUserDto(Guid Id, string Email, string FullName, UserRole Role);
