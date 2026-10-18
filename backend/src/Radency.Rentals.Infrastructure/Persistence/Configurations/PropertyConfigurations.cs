using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Radency.Rentals.Application.Properties;
using Radency.Rentals.Application.Units;
using Radency.Rentals.Domain.Properties;

namespace Radency.Rentals.Infrastructure.Persistence.Configurations;

internal sealed class PropertyConfiguration : IEntityTypeConfiguration<Property>
{
    public void Configure(EntityTypeBuilder<Property> builder)
    {
        builder.HasKey(p => p.Id);
        builder.Property(p => p.Id).ValueGeneratedNever();
        builder.Property(p => p.Name).HasMaxLength(PropertyRules.NameMaxLength).IsRequired();
        builder.Property(p => p.Address).HasMaxLength(PropertyRules.AddressMaxLength).IsRequired();
        builder.Property(p => p.City).HasMaxLength(PropertyRules.CityMaxLength).IsRequired();
        builder.Property(p => p.Version).IsConcurrencyToken();
        builder.HasIndex(p => p.Name);

        builder.HasMany(p => p.Units)
            .WithOne(u => u.Property)
            .HasForeignKey(u => u.PropertyId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

internal sealed class UnitConfiguration : IEntityTypeConfiguration<Unit>
{
    public void Configure(EntityTypeBuilder<Unit> builder)
    {
        builder.HasKey(u => u.Id);
        builder.Property(u => u.Id).ValueGeneratedNever();
        builder.Property(u => u.UnitNumber).HasMaxLength(UnitRules.UnitNumberMaxLength).IsRequired();
        builder.Property(u => u.MonthlyRent).HasPrecision(18, 2);
        builder.Property(u => u.Version).IsConcurrencyToken();
        builder.HasIndex(u => new { u.PropertyId, u.UnitNumber }).IsUnique();

        builder.HasOne(u => u.UnitType)
            .WithMany()
            .HasForeignKey(u => u.UnitTypeId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(u => u.Leases)
            .WithOne()
            .HasForeignKey(l => l.UnitId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

internal sealed class UnitTypeConfiguration : IEntityTypeConfiguration<UnitType>
{
    public void Configure(EntityTypeBuilder<UnitType> builder)
    {
        builder.HasKey(t => t.Id);
        builder.Property(t => t.Name).HasMaxLength(50).IsRequired();
        builder.HasIndex(t => t.Name).IsUnique();
    }
}
