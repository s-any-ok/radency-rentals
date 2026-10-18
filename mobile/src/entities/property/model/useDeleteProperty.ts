import { useMutation } from '@tanstack/react-query';

import { propertyMutationKeys } from '../keys';
import { DeletePropertyVariables } from '../types';

/** Logic is registered once in registerPropertyMutations (so offline-queued changes survive restarts). */
export const useDeleteProperty = () =>
  useMutation<void, Error, DeletePropertyVariables>({ mutationKey: propertyMutationKeys.remove });
