using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Radency.Rentals.Api.Auth;
using Radency.Rentals.Application.Units;

namespace Radency.Rentals.Api.Controllers;

[ApiController]
[Route("api/units")]
[Authorize]
[Produces("application/json")]
public sealed class UnitsController(UnitService units) : ControllerBase
{
    /// <summary>Units that are not covered by an active lease today.</summary>
    [HttpGet("available")]
    [ProducesResponseType<IReadOnlyList<AvailableUnitDto>>(StatusCodes.Status200OK)]
    public async Task<IReadOnlyList<AvailableUnitDto>> Available([FromQuery] Guid? propertyId, CancellationToken ct) =>
        await units.ListAvailableAsync(propertyId, ct);

    [HttpGet("{id:guid}")]
    [ProducesResponseType<UnitDto>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    public async Task<UnitDto> Get(Guid id, CancellationToken ct) =>
        await units.GetAsync(id, ct);

    [HttpPut("{id:guid}")]
    [Authorize(Policy = Policies.PropertyManager)]
    [ProducesResponseType<UnitDto>(StatusCodes.Status200OK)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status409Conflict)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status422UnprocessableEntity)]
    public async Task<UnitDto> Update(Guid id, UpdateUnitRequest request, CancellationToken ct) =>
        await units.UpdateAsync(id, request, ct);

    [HttpDelete("{id:guid}")]
    [Authorize(Policy = Policies.PropertyManager)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status409Conflict)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status422UnprocessableEntity)]
    public async Task<IActionResult> Delete(Guid id, [FromQuery] Guid version, CancellationToken ct)
    {
        await units.DeleteAsync(id, version, ct);
        return NoContent();
    }
}

[ApiController]
[Route("api/unit-types")]
[Authorize]
[Produces("application/json")]
public sealed class UnitTypesController(UnitService units) : ControllerBase
{
    /// <summary>All unit types, including inactive ones (which still display on units that use them).</summary>
    [HttpGet]
    [ProducesResponseType<IReadOnlyList<UnitTypeDto>>(StatusCodes.Status200OK)]
    public async Task<IReadOnlyList<UnitTypeDto>> List(CancellationToken ct) =>
        await units.ListUnitTypesAsync(ct);
}
