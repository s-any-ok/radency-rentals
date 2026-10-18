using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Radency.Rentals.Application.Applications;
using Radency.Rentals.Domain.Applications;
using Radency.Rentals.Domain.Leases;

namespace Radency.Rentals.Infrastructure.Persistence.Configurations;

internal sealed class RentalApplicationConfiguration : IEntityTypeConfiguration<RentalApplication>
{
    public void Configure(EntityTypeBuilder<RentalApplication> builder)
    {
        builder.ToTable("RentalApplications");
        builder.HasKey(a => a.Id);
        builder.Property(a => a.Id).ValueGeneratedNever();
        builder.Property(a => a.Status).HasConversion<string>().HasMaxLength(20);
        builder.Property(a => a.ApplicantName).HasMaxLength(ApplicationRules.NameMaxLength).IsRequired();
        builder.Property(a => a.LastReviewComment).HasMaxLength(ApplicationRules.CommentMaxLength);
        builder.Property(a => a.Version).IsConcurrencyToken();

        // Indexes back the list filters (status, property via unit) and the per-applicant view.
        builder.HasIndex(a => a.Status);
        builder.HasIndex(a => a.ApplicantId);
        builder.HasIndex(a => a.UnitId);
        builder.HasIndex(a => a.UpdatedAt);

        builder.Ignore(a => a.IsTerminal);
        builder.Ignore(a => a.IsEditableByApplicant);
        builder.Ignore(a => a.CanSubmit);
        builder.Ignore(a => a.CanWithdraw);
        builder.Ignore(a => a.CanReview);

        builder.OwnsOne(a => a.ApplicantInfo, info =>
        {
            info.Property(i => i.FullName).HasMaxLength(ApplicationRules.NameMaxLength);
            info.Property(i => i.Phone).HasMaxLength(30);
            info.Property(i => i.Email).HasMaxLength(ApplicationRules.EmailMaxLength);
            info.Property(i => i.CurrentAddress).HasMaxLength(ApplicationRules.AddressMaxLength);
        });

        // Residences are a value list that's always saved as a whole, so a JSON column fits.
        builder.OwnsMany(a => a.Residences, residence => residence.ToJson());

        builder.HasOne(a => a.Unit)
            .WithMany()
            .HasForeignKey(a => a.UnitId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(a => a.History)
            .WithOne()
            .HasForeignKey(h => h.ApplicationId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(a => a.Lease)
            .WithOne()
            .HasForeignKey<Lease>(l => l.ApplicationId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

internal sealed class ApplicationStatusChangeConfiguration : IEntityTypeConfiguration<ApplicationStatusChange>
{
    public void Configure(EntityTypeBuilder<ApplicationStatusChange> builder)
    {
        builder.HasKey(h => h.Id);
        builder.Property(h => h.Id).ValueGeneratedNever();
        builder.Property(h => h.FromStatus).HasConversion<string>().HasMaxLength(20);
        builder.Property(h => h.ToStatus).HasConversion<string>().HasMaxLength(20);
        builder.Property(h => h.Outcome).HasConversion<string>().HasMaxLength(20);
        builder.Property(h => h.Comment).HasMaxLength(ApplicationRules.CommentMaxLength);
        builder.Property(h => h.ChangedByName).HasMaxLength(ApplicationRules.NameMaxLength).IsRequired();
        builder.HasIndex(h => new { h.ApplicationId, h.ChangedAt });
    }
}

internal sealed class ManagerNoteConfiguration : IEntityTypeConfiguration<ManagerNote>
{
    public void Configure(EntityTypeBuilder<ManagerNote> builder)
    {
        builder.HasKey(n => n.ApplicationId);
        builder.Property(n => n.Text).HasMaxLength(ApplicationRules.NoteMaxLength).IsRequired();
        builder.Property(n => n.UpdatedByName).HasMaxLength(ApplicationRules.NameMaxLength).IsRequired();
        builder.Property(n => n.Version).IsConcurrencyToken();

        builder.HasOne<RentalApplication>()
            .WithOne()
            .HasForeignKey<ManagerNote>(n => n.ApplicationId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

internal sealed class LeaseConfiguration : IEntityTypeConfiguration<Lease>
{
    public void Configure(EntityTypeBuilder<Lease> builder)
    {
        builder.HasKey(l => l.Id);
        builder.Property(l => l.Id).ValueGeneratedNever();
        builder.HasIndex(l => l.ApplicationId).IsUnique();
        builder.HasIndex(l => new { l.UnitId, l.StartDate, l.EndDate });
    }
}
