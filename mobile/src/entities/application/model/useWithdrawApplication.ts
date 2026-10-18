import { useMutation } from '@tanstack/react-query';

import { applicationMutationKeys } from '../keys';
import { ApplicationDto, WithdrawApplicationVariables } from '../types';

/** Logic is registered once in registerApplicationMutations (so offline-queued changes survive restarts). */
export const useWithdrawApplication = () =>
  useMutation<ApplicationDto, Error, WithdrawApplicationVariables>({
    mutationKey: applicationMutationKeys.withdraw,
  });
