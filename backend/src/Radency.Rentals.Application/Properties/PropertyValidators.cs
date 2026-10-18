using FluentValidation;

namespace Radency.Rentals.Application.Properties;

public sealed class CreatePropertyRequestValidator : AbstractValidator<CreatePropertyRequest>
{
    public CreatePropertyRequestValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.Name).NotEmpty().MaximumLength(PropertyRules.NameMaxLength);
        RuleFor(x => x.Address).NotEmpty().MaximumLength(PropertyRules.AddressMaxLength);
        RuleFor(x => x.City).NotEmpty().MaximumLength(PropertyRules.CityMaxLength);
    }
}

public sealed class UpdatePropertyRequestValidator : AbstractValidator<UpdatePropertyRequest>
{
    public UpdatePropertyRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(PropertyRules.NameMaxLength);
        RuleFor(x => x.Address).NotEmpty().MaximumLength(PropertyRules.AddressMaxLength);
        RuleFor(x => x.City).NotEmpty().MaximumLength(PropertyRules.CityMaxLength);
        RuleFor(x => x.Version).NotEmpty();
    }
}

public static class PropertyRules
{
    public const int NameMaxLength = 200;
    public const int AddressMaxLength = 300;
    public const int CityMaxLength = 100;
}
