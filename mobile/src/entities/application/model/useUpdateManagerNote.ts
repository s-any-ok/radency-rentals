import { useMutation } from '@tanstack/react-query';

import { applicationMutationKeys } from '../keys';
import { ManagerNote, UpdateManagerNoteVariables } from '../types';

/** Logic is registered once in registerApplicationMutations (so offline-queued changes survive restarts). */
export const useUpdateManagerNote = () =>
  useMutation<ManagerNote, Error, UpdateManagerNoteVariables>({
    mutationKey: applicationMutationKeys.updateNote,
  });
