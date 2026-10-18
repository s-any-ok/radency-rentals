import { isAxiosError } from 'axios';

/** Error codes the API puts in the ProblemDetails "code" extension. */
export const ERROR_CODES = {
  validationFailed: 'validation_failed',
  concurrencyConflict: 'concurrency_conflict',
  notFound: 'not_found',
  forbidden: 'forbidden',
  unitTypeInactive: 'unit_type_inactive',
  unitHasActiveLease: 'unit_has_active_lease',
  unitNotAvailable: 'unit_not_available',
} as const;

type ProblemDetails = {
  title?: string;
  detail?: string;
  status?: number;
  code?: string;
  errors?: Record<string, string[]>;
};

/** Normalized API failure: status, stable code, human message and per-field errors. */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string | undefined;
  readonly fieldErrors: Record<string, string>;

  constructor(
    message: string,
    status: number,
    code?: string,
    fieldErrors: Record<string, string> = {},
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }

  get isConflict() {
    return this.status === 409;
  }

  get isValidation() {
    return this.status === 400;
  }

  /** The server understood and refused the change — retrying won't help. */
  get isRejection() {
    return this.status >= 400 && this.status < 500 && this.status !== 401 && this.status !== 408;
  }
}

/** No response at all: offline, DNS failure, timeout. Safe to retry later. */
export const isNetworkError = (error: unknown): boolean => isAxiosError(error) && !error.response;

/**
 * "residences[0].moveOutDate" → "residences.0.moveOutDate" (react-hook-form path syntax).
 * An empty key is a form-level error.
 */
export const toFormPath = (serverPath: string): string => serverPath.replace(/\[(\d+)\]/g, '.$1');

export const toApiError = (error: unknown): ApiError => {
  if (error instanceof ApiError) return error;

  if (isAxiosError(error)) {
    if (!error.response) {
      return new ApiError("Can't reach the server. Check your connection.", 0);
    }

    const problem = (error.response.data ?? {}) as ProblemDetails;
    const fieldErrors: Record<string, string> = {};
    for (const [field, messages] of Object.entries(problem.errors ?? {})) {
      if (messages[0]) fieldErrors[toFormPath(field)] = messages[0];
    }

    const firstFieldError = Object.values(fieldErrors)[0];
    const message =
      problem.status === 400 && firstFieldError
        ? firstFieldError
        : (problem.title ?? problem.detail ?? `Request failed (${error.response.status}).`);

    return new ApiError(message, error.response.status, problem.code, fieldErrors);
  }

  return new ApiError(error instanceof Error ? error.message : 'Something went wrong.', 0);
};

/** Human message for any error, with a friendlier text for stale-version conflicts. */
export const getErrorMessage = (error: unknown): string => {
  const apiError = toApiError(error);
  if (apiError.code === ERROR_CODES.concurrencyConflict) {
    return 'Someone else changed this record. Reload to see the latest version and try again.';
  }
  return apiError.message;
};
