import { useMutation } from '@tanstack/react-query';

import { applicationMutationKeys } from '../keys';
import { ApplicationDto, SubmitApplicationVariables } from '../types';

/** Logic is registered once in registerApplicationMutations (so offline-queued changes survive restarts). */
export const useSubmitApplication = () =>
  useMutation<ApplicationDto, Error, SubmitApplicationVariables>({
    mutationKey: applicationMutationKeys.submit,
  });
