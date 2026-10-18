import { useMutation } from '@tanstack/react-query';

import { sessionApi } from '../api';
import { SignUpRequest } from '../types';
import { completeSignIn } from './useSignIn';

export const useSignUp = () =>
  useMutation({
    mutationFn: async (request: SignUpRequest) => completeSignIn(await sessionApi.signUp(request)),
    networkMode: 'always',
    retry: false,
    scope: { id: 'auth' },
  });
