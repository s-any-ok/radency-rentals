using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Radency.Rentals.Api.Auth;
using Radency.Rentals.Application.Applications;
using Radency.Rentals.Application.Common;

namespace Radency.Rentals.Api.Controllers;

[ApiController]
[Route("api/applications")]
[Authorize]
[Produces("application/json")]
public sealed class ApplicationsController(ApplicationService applications) : ControllerBase
{
    /// <summary>
    /// Grid endpoint: one page of rows plus the filtered total. Filtering by status/property,
    /// sorting and paging run in the database. Applicants only get their own applications.
    /// </summary>
    [HttpGet]
    [ProducesResponseType<PagedResult<ApplicationListItemDto>>(StatusCodes.Status200OK)]
    public async Task<PagedResult<ApplicationListItemDto>> List([FromQuery] ApplicationListQuery query, CancellationToken ct) =>
        await applications.ListAsync(query, ct);

    [HttpGet("{id:guid}")]
    [ProducesResponseType<ApplicationDto>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    public async Task<ApplicationDto> Get(Guid id, CancellationToken ct) =>
        await applications.GetAsync(id, ct);

    /// <summary>Starts a draft application for an available unit. Idempotent on the client-generated id.</summary>
    [HttpPost]
    [Authorize(Policy = Policies.Applicant)]
    [ProducesResponseType<ApplicationDto>(StatusCodes.Status201Created)]
    [ProducesResponseType<ApplicationDto>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status422UnprocessableEntity)]
    public async Task<ActionResult<ApplicationDto>> Create(CreateApplicationRequest request, CancellationToken ct)
    {
        var (application, created) = await applications.CreateAsync(request, ct);
        return created ? CreatedAtAction(nameof(Get), new { id = application.Id }, application) : Ok(application);
    }

    /// <summary>
    /// The application page's single form action. <c>command</c> is the button that was pressed:
    /// <c>Continue</c> validates and saves the posted <c>section</c>; <c>Submit</c> submits.
    /// </summary>
    [HttpPost("{id:guid}/form")]
    [Authorize(Policy = Policies.Applicant)]
    [ProducesResponseType<ApplicationDto>(StatusCodes.Status200OK)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status409Conflict)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status422UnprocessableEntity)]
    public async Task<ApplicationDto> PostForm(Guid id, ApplicationFormRequest request, CancellationToken ct) =>
        await applications.PostFormAsync(id, request, ct);

    [HttpPost("{id:guid}/withdraw")]
    [Authorize(Policy = Policies.Applicant)]
    [ProducesResponseType<ApplicationDto>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status409Conflict)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status422UnprocessableEntity)]
    public async Task<ApplicationDto> Withdraw(Guid id, WithdrawApplicationRequest request, CancellationToken ct) =>
        await applications.WithdrawAsync(id, request, ct);

    /// <summary>Completes the review: Approve (issues a 12-month lease), Return or Deny (comment required).</summary>
    [HttpPost("{id:guid}/review")]
    [Authorize(Policy = Policies.PropertyManager)]
    [ProducesResponseType<ApplicationDto>(StatusCodes.Status200OK)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status409Conflict)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status422UnprocessableEntity)]
    public async Task<ApplicationDto> Review(Guid id, ReviewApplicationRequest request, CancellationToken ct) =>
        await applications.ReviewAsync(id, request, ct);

    [HttpGet("{id:guid}/history")]
    [Authorize(Policy = Policies.PropertyManager)]
    [ProducesResponseType<IReadOnlyList<StatusChangeDto>>(StatusCodes.Status200OK)]
    public async Task<IReadOnlyList<StatusChangeDto>> History(Guid id, CancellationToken ct) =>
        await applications.GetHistoryAsync(id, ct);

    /// <summary>Internal notes. Never exposed to applicants (policy-protected, separate resource).</summary>
    [HttpGet("{id:guid}/notes")]
    [Authorize(Policy = Policies.PropertyManager)]
    [ProducesResponseType<ManagerNoteDto>(StatusCodes.Status200OK)]
    public async Task<ManagerNoteDto> GetNotes(Guid id, CancellationToken ct) =>
        await applications.GetManagerNoteAsync(id, ct);

    [HttpPut("{id:guid}/notes")]
    [Authorize(Policy = Policies.PropertyManager)]
    [ProducesResponseType<ManagerNoteDto>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status409Conflict)]
    public async Task<ManagerNoteDto> UpdateNotes(Guid id, UpdateManagerNoteRequest request, CancellationToken ct) =>
        await applications.UpdateManagerNoteAsync(id, request, ct);
}
