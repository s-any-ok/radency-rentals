namespace Radency.Rentals.Application.Common;

/// <summary>A page of rows plus the total number of rows matching the filter.</summary>
public sealed record PagedResult<T>(IReadOnlyList<T> Items, int Total, int Page, int PageSize);

public enum SortDirection
{
    Asc,
    Desc,
}
