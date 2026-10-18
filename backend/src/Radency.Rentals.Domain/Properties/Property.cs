using Radency.Rentals.Domain.Common;

namespace Radency.Rentals.Domain.Properties;

public sealed class Property : IVersioned
{
    private Property()
    {
    }

    public Property(Guid id, string name, string address, string city, DateTime now)
    {
        Id = id;
        Name = name.Trim();
        Address = address.Trim();
        City = city.Trim();
        CreatedAt = now;
        UpdatedAt = now;
    }

    public Guid Id { get; private set; }

    public string Name { get; private set; } = string.Empty;

    public string Address { get; private set; } = string.Empty;

    public string City { get; private set; } = string.Empty;

    public List<Unit> Units { get; private set; } = [];

    public DateTime CreatedAt { get; private set; }

    public DateTime UpdatedAt { get; private set; }

    public Guid Version { get; set; }

    public void Update(string name, string address, string city, DateTime now)
    {
        Name = name.Trim();
        Address = address.Trim();
        City = city.Trim();
        UpdatedAt = now;
    }
}
