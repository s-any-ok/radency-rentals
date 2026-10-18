import { clearTokens, loadTokens, saveTokens } from 'src/shared/lib';
import { SessionTokens, useSessionStore } from 'src/shared/model';

import { AccessTokenResponse, CurrentUserDto } from '../types';

/** Refresh a little before the real expiry so in-flight requests don't race it. */
const EXPIRY_SKEW_MS = 30 * 1000;

export const toSessionTokens = (response: AccessTokenResponse): SessionTokens => ({
  accessToken: response.accessToken,
  refreshToken: response.refreshToken,
  expiresAt: Date.now() + response.expiresIn * 1000 - EXPIRY_SKEW_MS,
});

/** Persists tokens to secure storage and marks the session as signed in. */
export const storeTokens = async (response: AccessTokenResponse): Promise<SessionTokens> => {
  const tokens = toSessionTokens(response);
  await saveTokens(tokens);
  useSessionStore.getState().setTokens(tokens);
  return tokens;
};

export const storeUser = (user: CurrentUserDto) => useSessionStore.getState().setUser(user);

/** App start: a stored session is restored even without network, so the user stays signed in offline. */
export const restoreSession = async (): Promise<void> => {
  const tokens = await loadTokens();
  useSessionStore.getState().restore(tokens);
};

export const clearSession = async (): Promise<void> => {
  await clearTokens();
  useSessionStore.getState().clear();
};
