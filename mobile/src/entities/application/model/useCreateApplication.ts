import { useMutation } from '@tanstack/react-query';

import { applicationMutationKeys } from '../keys';
import { ApplicationDto, CreateApplicationVariables } from '../types';

/** Logic is registered once in registerApplicationMutations (so offline-queued changes survive restarts). */
export const useCreateApplication = () =>
  useMutation<ApplicationDto, Error, CreateApplicationVariables>({
    mutationKey: applicationMutationKeys.create,
  });
