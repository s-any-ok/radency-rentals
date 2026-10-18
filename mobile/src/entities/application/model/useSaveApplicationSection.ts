import { useMutation } from '@tanstack/react-query';

import { applicationMutationKeys } from '../keys';
import { ApplicationDto, SaveSectionVariables } from '../types';

/** Logic is registered once in registerApplicationMutations (so offline-queued changes survive restarts). */
export const useSaveApplicationSection = () =>
  useMutation<ApplicationDto, Error, SaveSectionVariables>({
    mutationKey: applicationMutationKeys.saveSection,
  });
