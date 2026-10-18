using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Radency.Rentals.Application.Common;
using Radency.Rentals.Domain.Common;

namespace Radency.Rentals.Api.Infrastructure;

/// <summary>
/// Maps expected failures to RFC 7807 problem responses with a stable "code" extension:
/// 400 validation (errors keyed by field), 403 forbidden, 404 not found,
/// 409 concurrency conflict (stale version), 422 business rule rejected.
/// </summary>
internal sealed class ApiExceptionHandler(IProblemDetailsService problemDetailsService, ILogger<ApiExceptionHandler> logger)
    : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
    {
        ProblemDetails? problem = exception switch
        {
            RequestValidationException validation => new ValidationProblemDetails(validation.Errors)
            {
                Status = StatusCodes.Status400BadRequest,
                Title = validation.Message,
            },
            NotFoundException notFound => Problem(StatusCodes.Status404NotFound, notFound.Message),
            ForbiddenException forbidden => Problem(StatusCodes.Status403Forbidden, forbidden.Message),
            ConcurrencyException concurrency => Problem(StatusCodes.Status409Conflict, concurrency.Message),
            DbUpdateConcurrencyException => Problem(StatusCodes.Status409Conflict, new ConcurrencyException().Message),
            BusinessRuleException rule => Problem(StatusCodes.Status422UnprocessableEntity, rule.Message),
            _ => null,
        };

        if (problem is null)
        {
            return false;
        }

        problem.Extensions["code"] = exception switch
        {
            DomainException domain => domain.Code,
            DbUpdateConcurrencyException => ErrorCodes.ConcurrencyConflict,
            _ => null,
        };

        if (exception is DbUpdateConcurrencyException)
        {
            logger.LogInformation("Rejected a write that raced with another one: {Message}", exception.Message);
        }

        httpContext.Response.StatusCode = problem.Status ?? StatusCodes.Status500InternalServerError;

        return await problemDetailsService.TryWriteAsync(new ProblemDetailsContext
        {
            HttpContext = httpContext,
            ProblemDetails = problem,
            Exception = exception,
        });
    }

    private static ProblemDetails Problem(int status, string title) => new() { Status = status, Title = title };
}
