import { useMutation } from '@tanstack/react-query';

import { sessionApi } from '../api';
import { storeTokens, storeUser } from '../lib/session';
import { AccessTokenResponse, CurrentUserDto, SignInRequest } from '../types';

/** Loads the profile with the new token first, so the app never sees a session without a role. */
export const completeSignIn = async (response: AccessTokenResponse): Promise<CurrentUserDto> => {
  const user = await sessionApi.meWithToken(response.accessToken);
  storeUser(user);
  await storeTokens(response);
  return user;
};

export const useSignIn = () =>
  useMutation({
    mutationFn: async (request: SignInRequest) => completeSignIn(await sessionApi.signIn(request)),
    // Auth must answer immediately (never queued) — fail fast when offline.
    networkMode: 'always',
    retry: false,
    scope: { id: 'auth' },
  });
