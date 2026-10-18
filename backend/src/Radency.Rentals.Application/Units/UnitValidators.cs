using FluentValidation;

namespace Radency.Rentals.Application.Units;

public sealed class CreateUnitRequestValidator : AbstractValidator<CreateUnitRequest>
{
    public CreateUnitRequestValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.UnitNumber).NotEmpty().MaximumLength(UnitRules.UnitNumberMaxLength);
        RuleFor(x => x.Bedrooms).InclusiveBetween(0, UnitRules.MaxBedrooms);
        RuleFor(x => x.MonthlyRent).GreaterThan(0).LessThanOrEqualTo(UnitRules.MaxMonthlyRent);
        RuleFor(x => x.UnitTypeId).GreaterThan(0).WithMessage("Select a unit type.");
    }
}

public sealed class UpdateUnitRequestValidator : AbstractValidator<UpdateUnitRequest>
{
    public UpdateUnitRequestValidator()
    {
        RuleFor(x => x.UnitNumber).NotEmpty().MaximumLength(UnitRules.UnitNumberMaxLength);
        RuleFor(x => x.Bedrooms).InclusiveBetween(0, UnitRules.MaxBedrooms);
        RuleFor(x => x.MonthlyRent).GreaterThan(0).LessThanOrEqualTo(UnitRules.MaxMonthlyRent);
        RuleFor(x => x.UnitTypeId).GreaterThan(0).WithMessage("Select a unit type.");
        RuleFor(x => x.Version).NotEmpty();
    }
}

public static class UnitRules
{
    public const int UnitNumberMaxLength = 20;
    public const int MaxBedrooms = 10;
    public const decimal MaxMonthlyRent = 100_000m;
}
