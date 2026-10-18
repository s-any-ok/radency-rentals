using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Radency.Rentals.Api.Auth;
using Radency.Rentals.Application.Properties;
using Radency.Rentals.Application.Units;

namespace Radency.Rentals.Api.Controllers;

[ApiController]
[Route("api/properties")]
[Authorize]
[Produces("application/json")]
public sealed class PropertiesController(PropertyService properties, UnitService units) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType<IReadOnlyList<PropertyDto>>(StatusCodes.Status200OK)]
    public async Task<IReadOnlyList<PropertyDto>> List(CancellationToken ct) =>
        await properties.ListAsync(ct);

    [HttpGet("{id:guid}")]
    [ProducesResponseType<PropertyDetailsDto>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    public async Task<PropertyDetailsDto> Get(Guid id, CancellationToken ct) =>
        await properties.GetAsync(id, ct);

    /// <summary>Creates a property. Idempotent on the client-generated id.</summary>
    [HttpPost]
    [Authorize(Policy = Policies.PropertyManager)]
    [ProducesResponseType<PropertyDetailsDto>(StatusCodes.Status201Created)]
    [ProducesResponseType<PropertyDetailsDto>(StatusCodes.Status200OK)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<PropertyDetailsDto>> Create(CreatePropertyRequest request, CancellationToken ct)
    {
        var (property, created) = await properties.CreateAsync(request, ct);
        return created ? CreatedAtAction(nameof(Get), new { id = property.Id }, property) : Ok(property);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Policy = Policies.PropertyManager)]
    [ProducesResponseType<PropertyDetailsDto>(StatusCodes.Status200OK)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status409Conflict)]
    public async Task<PropertyDetailsDto> Update(Guid id, UpdatePropertyRequest request, CancellationToken ct) =>
        await properties.UpdateAsync(id, request, ct);

    [HttpDelete("{id:guid}")]
    [Authorize(Policy = Policies.PropertyManager)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status409Conflict)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status422UnprocessableEntity)]
    public async Task<IActionResult> Delete(Guid id, [FromQuery] Guid version, CancellationToken ct)
    {
        await properties.DeleteAsync(id, version, ct);
        return NoContent();
    }

    /// <summary>Adds a unit to the property. Idempotent on the client-generated id.</summary>
    [HttpPost("{propertyId:guid}/units")]
    [Authorize(Policy = Policies.PropertyManager)]
    [ProducesResponseType<UnitDto>(StatusCodes.Status201Created)]
    [ProducesResponseType<UnitDto>(StatusCodes.Status200OK)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status422UnprocessableEntity)]
    public async Task<ActionResult<UnitDto>> CreateUnit(Guid propertyId, CreateUnitRequest request, CancellationToken ct)
    {
        var (unit, created) = await units.CreateAsync(propertyId, request, ct);
        return created
            ? CreatedAtAction(nameof(UnitsController.Get), "Units", new { id = unit.Id }, unit)
            : Ok(unit);
    }
}
