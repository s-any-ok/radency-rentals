import { apiFacade } from 'src/shared/api';

import { AccessTokenResponse, CurrentUserDto, SignInRequest, SignUpRequest } from './types';

/** Marks requests the auth interceptor must not try to refresh-and-retry. */
export const SKIP_AUTH_REFRESH = { skipAuthRefresh: true } as const;

export const sessionApi = {
  signIn: (request: SignInRequest) =>
    apiFacade.post<AccessTokenResponse>('/auth/login', request, SKIP_AUTH_REFRESH),
  signUp: (request: SignUpRequest) =>
    apiFacade.post<AccessTokenResponse>('/auth/register', request, SKIP_AUTH_REFRESH),
  refresh: (refreshToken: string) =>
    apiFacade.post<AccessTokenResponse>('/auth/refresh', { refreshToken }, SKIP_AUTH_REFRESH),
  me: () => apiFacade.get<CurrentUserDto>('/auth/me'),
  /** Used right after sign-in, before the token is committed to the session store. */
  meWithToken: (accessToken: string) =>
    apiFacade.get<CurrentUserDto>('/auth/me', {
      ...SKIP_AUTH_REFRESH,
      headers: { Authorization: `Bearer ${accessToken}` },
    }),
  signOut: () => apiFacade.post<void>('/auth/logout', undefined, SKIP_AUTH_REFRESH),
};
