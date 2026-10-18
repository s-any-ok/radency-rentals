namespace Radency.Rentals.Domain.Properties;

/// <summary>
/// Lookup value for a unit's type. An inactive value keeps displaying on units that
/// already use it, but can't be selected for any other unit.
/// </summary>
public sealed class UnitType
{
    private UnitType()
    {
    }

    public UnitType(string name, bool isActive = true)
    {
        Name = name;
        IsActive = isActive;
    }

    public int Id { get; private set; }

    public string Name { get; private set; } = string.Empty;

    public bool IsActive { get; private set; }

    public void Activate() => IsActive = true;

    public void Deactivate() => IsActive = false;
}
