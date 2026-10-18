using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Radency.Rentals.Infrastructure.Idempotency;
using Radency.Rentals.Infrastructure.Persistence;

namespace Radency.Rentals.Api.Infrastructure;

/// <summary>
/// Makes any mutating request safe to replay. The mobile app attaches an Idempotency-Key to every
/// queued change; when the same key arrives again (e.g. the response was lost while offline and the
/// request is replayed) the stored response is returned and the action does not run a second time.
/// </summary>
internal sealed class IdempotencyFilter(
    RentalsDbContext db,
    IOptions<JsonOptions> jsonOptions,
    TimeProvider clock,
    ILogger<IdempotencyFilter> logger) : IAsyncActionFilter
{
    public const string HeaderName = "Idempotency-Key";
    private const int MaxKeyLength = 100;

    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var request = context.HttpContext.Request;
        var key = request.Headers[HeaderName].ToString();

        if (HttpMethods.IsGet(request.Method) || string.IsNullOrWhiteSpace(key) || !IsAuthenticated(context, out var userId))
        {
            await next();
            return;
        }

        if (key.Length > MaxKeyLength)
        {
            context.Result = new BadRequestObjectResult(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = $"{HeaderName} must be at most {MaxKeyLength} characters.",
            });
            return;
        }

        var path = request.Path.Value ?? string.Empty;
        var stored = await db.IdempotencyRecords.AsNoTracking()
            .FirstOrDefaultAsync(r => r.UserId == userId && r.Key == key, context.HttpContext.RequestAborted);

        if (stored is not null)
        {
            context.Result = stored.Method == request.Method && stored.Path == path
                ? Replay(stored)
                : new UnprocessableEntityObjectResult(new ProblemDetails
                {
                    Status = StatusCodes.Status422UnprocessableEntity,
                    Title = $"This {HeaderName} was already used for a different request.",
                });
            return;
        }

        var executed = await next();

        if (executed.Exception is not null && !executed.ExceptionHandled)
        {
            return;
        }

        if (TryCapture(executed.Result, out var statusCode, out var body))
        {
            await SaveAsync(new IdempotencyRecord
            {
                UserId = userId,
                Key = key,
                Method = request.Method,
                Path = path,
                StatusCode = statusCode,
                ResponseBody = body,
                CreatedAt = clock.GetUtcNow().UtcDateTime,
            });
        }
    }

    private static bool IsAuthenticated(ActionExecutingContext context, out Guid userId)
    {
        userId = Guid.Empty;
        return context.HttpContext.User.Identity?.IsAuthenticated == true
               && Guid.TryParse(context.HttpContext.User.FindFirstValue(ClaimTypes.NameIdentifier), out userId);
    }

    /// <summary>Only successful outcomes are stored; failures may legitimately succeed on a later retry.</summary>
    private bool TryCapture(IActionResult? result, out int statusCode, out string? body)
    {
        switch (result)
        {
            case ObjectResult { Value: var value } objectResult:
                statusCode = objectResult.StatusCode ?? StatusCodes.Status200OK;
                body = value is null ? null : JsonSerializer.Serialize(value, value.GetType(), jsonOptions.Value.JsonSerializerOptions);
                break;
            case StatusCodeResult statusCodeResult:
                statusCode = statusCodeResult.StatusCode;
                body = null;
                break;
            default:
                statusCode = 0;
                body = null;
                return false;
        }

        return statusCode is >= 200 and < 300;
    }

    private static IActionResult Replay(IdempotencyRecord stored) =>
        stored.ResponseBody is null
            ? new StatusCodeResult(stored.StatusCode)
            : new ContentResult
            {
                StatusCode = stored.StatusCode,
                Content = stored.ResponseBody,
                ContentType = "application/json; charset=utf-8",
            };

    private async Task SaveAsync(IdempotencyRecord record)
    {
        // Use a clean change tracker so a failure here can't interfere with what the action saved.
        db.ChangeTracker.Clear();
        db.IdempotencyRecords.Add(record);

        try
        {
            await db.SaveChangesAsync();
        }
        catch (DbUpdateException ex)
        {
            // A concurrent request with the same key stored its result first; that's fine.
            logger.LogDebug(ex, "Idempotency record {Key} was already stored", record.Key);
        }
        finally
        {
            db.ChangeTracker.Clear();
        }
    }
}
