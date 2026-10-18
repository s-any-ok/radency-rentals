import { AxiosError, AxiosHeaders } from 'axios';

import { ERROR_CODES, getErrorMessage, toApiError, toFormPath } from '../errors';

const axiosError = (status: number, data: unknown) =>
  new AxiosError('failed', 'ERR', undefined, undefined, {
    status,
    statusText: '',
    data,
    headers: {},
    config: { headers: new AxiosHeaders() },
  });

describe('API errors', () => {
  it('maps server field paths to react-hook-form paths', () => {
    expect(toFormPath('residences[2].moveOutDate')).toBe('residences.2.moveOutDate');
    expect(toFormPath('applicantInfo.phone')).toBe('applicantInfo.phone');
  });

  it('reads ProblemDetails validation errors per field', () => {
    const error = toApiError(
      axiosError(400, {
        title: 'One or more fields are invalid.',
        status: 400,
        code: ERROR_CODES.validationFailed,
        errors: { 'residences[0].moveOutDate': ['Move-out date must be after the move-in date.'] },
      }),
    );

    expect(error.isValidation).toBe(true);
    expect(error.fieldErrors).toEqual({
      'residences.0.moveOutDate': 'Move-out date must be after the move-in date.',
    });
  });

  it('treats a 409 concurrency conflict as a rejection with a friendly message', () => {
    const raw = axiosError(409, {
      title: 'Changed',
      status: 409,
      code: ERROR_CODES.concurrencyConflict,
    });

    expect(toApiError(raw).isRejection).toBe(true);
    expect(getErrorMessage(raw)).toMatch(/Reload/);
  });

  it('treats a missing response as a network error, not a rejection', () => {
    const error = toApiError(new AxiosError('Network Error', 'ERR_NETWORK'));

    expect(error.status).toBe(0);
    expect(error.isRejection).toBe(false);
  });
});
