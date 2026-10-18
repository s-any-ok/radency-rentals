using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using Radency.Rentals.Application.Applications;
using Radency.Rentals.Application.Properties;
using Radency.Rentals.Application.Units;

namespace Radency.Rentals.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddValidatorsFromAssemblyContaining<ApplicantInfoValidator>(ServiceLifetime.Singleton);

        services.AddScoped<PropertyService>();
        services.AddScoped<UnitService>();
        services.AddScoped<ApplicationService>();

        return services;
    }
}
