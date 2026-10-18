using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Radency.Rentals.Application.Abstractions;
using Radency.Rentals.Infrastructure.Identity;
using Radency.Rentals.Infrastructure.Persistence;
using Radency.Rentals.Infrastructure.Seeding;

namespace Radency.Rentals.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("Rentals")
                               ?? throw new InvalidOperationException("Connection string 'Rentals' is not configured.");

        services.AddDbContext<RentalsDbContext>(options =>
            options.UseSqlServer(connectionString, sql => sql.EnableRetryOnFailure(maxRetryCount: 5)));

        services.AddScoped<IRentalsDbContext>(sp => sp.GetRequiredService<RentalsDbContext>());

        services.AddIdentityCore<ApplicationUser>(options =>
            {
                options.User.RequireUniqueEmail = true;
                options.Password.RequiredLength = 8;
                options.Password.RequireDigit = true;
                options.Password.RequireLowercase = true;
                options.Password.RequireUppercase = true;
                options.Password.RequireNonAlphanumeric = false;
                options.Lockout.MaxFailedAccessAttempts = 10;
            })
            .AddRoles<IdentityRole<Guid>>()
            .AddClaimsPrincipalFactory<AppClaimsPrincipalFactory>()
            .AddEntityFrameworkStores<RentalsDbContext>()
            .AddSignInManager()
            .AddDefaultTokenProviders();

        services.AddScoped<DatabaseSeeder>();
        services.AddScoped<DatabaseInitializer>();

        return services;
    }
}
