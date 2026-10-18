import { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

import { useSessionStore } from 'src/shared/model';

import { sessionApi } from '../api';
import { clearSession, storeTokens } from '../lib/session';

let refreshPromise: Promise<string | null> | null = null;

/**
 * Exchanges the refresh token for a new access token. Concurrent 401s share one refresh.
 * Resolves null when the server rejected the refresh token (session is over);
 * rejects on network errors (session is kept — the user may simply be offline).
 */
const refreshAccessToken = (): Promise<string | null> => {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refreshToken = useSessionStore.getState().tokens?.refreshToken;
      if (!refreshToken) return null;

      try {
        const response = await sessionApi.refresh(refreshToken);
        return (await storeTokens(response)).accessToken;
      } catch (error) {
        const status = (error as AxiosError).response?.status;
        if (status === 400 || status === 401) {
          await clearSession();
          return null;
        }
        throw error;
      }
    })().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
};

/** Attaches the bearer token to every request and transparently refreshes it on 401. */
export const setupAuthInterceptor = (instance: AxiosInstance) => {
  instance.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
    let tokens = useSessionStore.getState().tokens;

    // Proactively refresh an expired access token (e.g. after the app was offline for a while).
    if (tokens && !config.skipAuthRefresh && tokens.expiresAt <= Date.now()) {
      try {
        await refreshAccessToken();
      } catch {
        // Network error: send the request anyway; the response handling decides what happens.
      }
      tokens = useSessionStore.getState().tokens;
    }

    if (tokens?.accessToken) {
      config.headers.Authorization = `Bearer ${tokens.accessToken}`;
    }
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const config = error.config;

      if (
        error.response?.status !== 401 ||
        !config ||
        config.skipAuthRefresh ||
        config.retriedAfterRefresh
      ) {
        throw error;
      }

      const accessToken = await refreshAccessToken();
      if (!accessToken) throw error;

      config.retriedAfterRefresh = true;
      config.headers.Authorization = `Bearer ${accessToken}`;
      return instance.request(config);
    },
  );
};
