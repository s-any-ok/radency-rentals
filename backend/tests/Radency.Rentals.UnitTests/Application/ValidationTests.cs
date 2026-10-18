using Radency.Rentals.Application.Applications;
using Radency.Rentals.Application.Common;
using Radency.Rentals.UnitTests.Support;

namespace Radency.Rentals.UnitTests.Application;

public sealed class ValidationTests
{
    private static readonly FixedClock Clock = new(new DateTimeOffset(2026, 10, 15, 12, 0, 0, TimeSpan.Zero));

    [Theory]
    [InlineData("FullName", null, "fullName")]
    [InlineData("Residences[2].MoveOutDate", null, "residences[2].moveOutDate")]
    [InlineData("Phone", "applicantInfo", "applicantInfo.phone")]
    public void Field_paths_are_camel_cased_and_prefixed(string property, string? prefix, string expected) =>
        Assert.Equal(expected, ValidationExtensions.ToFieldPath(property, prefix));

    [Theory]
    [InlineData("+1 (555) 123-4567", true)]
    [InlineData("5551234567", true)]
    [InlineData("call me", false)]
    [InlineData("123", false)]
    public void Phone_numbers_are_validated(string phone, bool valid)
    {
        var result = new ApplicantInfoValidator().Validate(new ApplicantInfoDto("Jordan", phone, "j@example.com", "1 Main St"));

        Assert.Equal(valid, result.IsValid);
    }

    [Fact]
    public void Residence_history_needs_at_least_one_residence()
    {
        var validator = new ResidenceHistoryValidator(new ResidenceValidator(Clock));

        var result = validator.Validate(new ResidenceHistoryInput([]));

        Assert.Contains(result.Errors, e => e.PropertyName == "Residences");
    }

    [Fact]
    public void Move_out_date_cannot_be_in_the_future()
    {
        var validator = new ResidenceValidator(Clock);

        var result = validator.Validate(new ResidenceDto("1 Main", "Pat", "+1 555 123 4567", new DateOnly(2025, 1, 1), new DateOnly(2027, 1, 1)));

        Assert.Contains(result.Errors, e => e.PropertyName == "MoveOutDate");
    }
}
