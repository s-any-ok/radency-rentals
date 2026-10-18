import { AxiosRequestConfig } from 'axios';

import { instance } from './instance';

export const IDEMPOTENCY_HEADER = 'Idempotency-Key';

/** Request config for a mutating call that is safe to replay with the same key. */
export const idempotent = (key: string, config?: AxiosRequestConfig): AxiosRequestConfig => ({
  ...config,
  headers: { ...config?.headers, [IDEMPOTENCY_HEADER]: key },
});

export const apiFacade = {
  get: async <T>(url: string, config?: AxiosRequestConfig) =>
    (await instance.get<T>(url, config)).data,
  post: async <T>(url: string, body?: unknown, config?: AxiosRequestConfig) =>
    (await instance.post<T>(url, body, config)).data,
  put: async <T>(url: string, body?: unknown, config?: AxiosRequestConfig) =>
    (await instance.put<T>(url, body, config)).data,
  delete: async (url: string, config?: AxiosRequestConfig) => {
    await instance.delete(url, config);
  },
} as const;
