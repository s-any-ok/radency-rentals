using FluentValidation;
using Radency.Rentals.Application.Common;
using Radency.Rentals.Domain.Applications;

namespace Radency.Rentals.Application.Applications;

public static class ApplicationRules
{
    public const int NameMaxLength = 200;
    public const int AddressMaxLength = 300;
    public const int EmailMaxLength = 254;
    public const int CommentMaxLength = 2000;
    public const int NoteMaxLength = 4000;
    public const int MaxResidences = 20;

    /// <summary>Digits with optional leading +, spaces, dashes and parentheses; 7-15 digits overall.</summary>
    public const string PhonePattern = @"^\+?[0-9\s\-()]{7,20}$";
}

/// <summary>Rules for the "Applicant Information" section, defined once and used on every save.</summary>
public sealed class ApplicantInfoValidator : AbstractValidator<ApplicantInfoDto>
{
    public ApplicantInfoValidator()
    {
        RuleFor(x => x.FullName)
            .NotEmpty().WithMessage("Name is required.")
            .MaximumLength(ApplicationRules.NameMaxLength);
        RuleFor(x => x.Phone)
            .NotEmpty().WithMessage("Phone is required.")
            .Matches(ApplicationRules.PhonePattern).WithMessage("Enter a valid phone number.");
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required.")
            .EmailAddress().WithMessage("Enter a valid email address.")
            .MaximumLength(ApplicationRules.EmailMaxLength);
        RuleFor(x => x.CurrentAddress)
            .NotEmpty().WithMessage("Current address is required.")
            .MaximumLength(ApplicationRules.AddressMaxLength);
    }
}

public sealed class ResidenceValidator : AbstractValidator<ResidenceDto>
{
    public ResidenceValidator(TimeProvider clock)
    {
        RuleFor(x => x.Address)
            .NotEmpty().WithMessage("Address is required.")
            .MaximumLength(ApplicationRules.AddressMaxLength);
        RuleFor(x => x.LandlordName)
            .NotEmpty().WithMessage("Landlord name is required.")
            .MaximumLength(ApplicationRules.NameMaxLength);
        RuleFor(x => x.LandlordPhone)
            .NotEmpty().WithMessage("Landlord phone is required.")
            .Matches(ApplicationRules.PhonePattern).WithMessage("Enter a valid phone number.");
        RuleFor(x => x.MoveInDate)
            .NotEmpty().WithMessage("Move-in date is required.");
        RuleFor(x => x.MoveOutDate)
            .NotEmpty().WithMessage("Move-out date is required.")
            .GreaterThan(x => x.MoveInDate).WithMessage("Move-out date must be after the move-in date.")
            .Must(date => date <= clock.Today()).WithMessage("Move-out date can't be in the future.");
    }
}

public sealed class ResidenceHistoryValidator : AbstractValidator<ResidenceHistoryInput>
{
    public ResidenceHistoryValidator(IValidator<ResidenceDto> residenceValidator)
    {
        RuleFor(x => x.Residences)
            .NotEmpty().WithMessage("Add at least one prior residence.")
            .Must(r => r.Count <= ApplicationRules.MaxResidences)
            .WithMessage($"No more than {ApplicationRules.MaxResidences} residences can be added.");
        RuleForEach(x => x.Residences).SetValidator(residenceValidator);
    }
}

public sealed class ReviewApplicationRequestValidator : AbstractValidator<ReviewApplicationRequest>
{
    public ReviewApplicationRequestValidator()
    {
        RuleFor(x => x.Outcome).IsInEnum();
        RuleFor(x => x.Comment)
            .NotEmpty()
            .When(x => x.Outcome is ReviewOutcome.Return or ReviewOutcome.Deny)
            .WithMessage("A comment is required when returning or denying an application.");
        RuleFor(x => x.Comment).MaximumLength(ApplicationRules.CommentMaxLength);
        RuleFor(x => x.Version).NotEmpty();
    }
}

public sealed class UpdateManagerNoteRequestValidator : AbstractValidator<UpdateManagerNoteRequest>
{
    public UpdateManagerNoteRequestValidator()
    {
        RuleFor(x => x.Text).NotNull().MaximumLength(ApplicationRules.NoteMaxLength);
    }
}
