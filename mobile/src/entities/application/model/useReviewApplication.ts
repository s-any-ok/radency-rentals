import { useMutation } from '@tanstack/react-query';

import { applicationMutationKeys } from '../keys';
import { ApplicationDto, ReviewApplicationVariables } from '../types';

/** Logic is registered once in registerApplicationMutations (so offline-queued changes survive restarts). */
export const useReviewApplication = () =>
  useMutation<ApplicationDto, Error, ReviewApplicationVariables>({
    mutationKey: applicationMutationKeys.review,
  });
