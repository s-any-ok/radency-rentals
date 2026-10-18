import { useMutation } from '@tanstack/react-query';

import { propertyMutationKeys } from '../keys';
import { DeleteUnitVariables } from '../types';

/** Logic is registered once in registerPropertyMutations (so offline-queued changes survive restarts). */
export const useDeleteUnit = () =>
  useMutation<void, Error, DeleteUnitVariables>({ mutationKey: propertyMutationKeys.removeUnit });
