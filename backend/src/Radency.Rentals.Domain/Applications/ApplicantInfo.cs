namespace Radency.Rentals.Domain.Applications;

/// <summary>"Applicant Information" section of an application.</summary>
public sealed class ApplicantInfo
{
    public ApplicantInfo(string fullName, string phone, string email, string currentAddress)
    {
        FullName = fullName.Trim();
        Phone = phone.Trim();
        Email = email.Trim();
        CurrentAddress = currentAddress.Trim();
    }

    public string FullName { get; private set; }

    public string Phone { get; private set; }

    public string Email { get; private set; }

    public string CurrentAddress { get; private set; }
}
