using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Radency.Rentals.Infrastructure.Persistence;

/// <summary>Used by "dotnet ef" so migrations can be created without running the API.</summary>
internal sealed class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<RentalsDbContext>
{
    public RentalsDbContext CreateDbContext(string[] args)
    {
        var options = new DbContextOptionsBuilder<RentalsDbContext>()
            .UseSqlServer("Server=localhost,1433;Database=RadencyRentals;User Id=sa;Password=placeholder;TrustServerCertificate=True")
            .Options;

        return new RentalsDbContext(options);
    }
}
