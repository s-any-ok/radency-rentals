using Radency.Rentals.Domain.Common;

namespace Radency.Rentals.Application.Abstractions;

public interface ICurrentUser
{
    Guid UserId { get; }

    string Name { get; }

    bool IsPropertyManager { get; }

    bool IsApplicant { get; }

    Actor AsActor() => new(UserId, Name);
}
