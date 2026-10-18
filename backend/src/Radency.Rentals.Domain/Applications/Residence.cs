namespace Radency.Rentals.Domain.Applications;

/// <summary>One prior residence in the "Residence History" section.</summary>
public sealed class Residence
{
    public Residence(
        string address,
        string landlordName,
        string landlordPhone,
        DateOnly moveInDate,
        DateOnly moveOutDate)
    {
        Address = address.Trim();
        LandlordName = landlordName.Trim();
        LandlordPhone = landlordPhone.Trim();
        MoveInDate = moveInDate;
        MoveOutDate = moveOutDate;
    }

    public string Address { get; private set; }

    public string LandlordName { get; private set; }

    public string LandlordPhone { get; private set; }

    public DateOnly MoveInDate { get; private set; }

    public DateOnly MoveOutDate { get; private set; }
}
