import { useMutation } from '@tanstack/react-query';

import { propertyMutationKeys } from '../keys';
import { PropertyDetailsDto, UpdatePropertyVariables } from '../types';

/** Logic is registered once in registerPropertyMutations (so offline-queued changes survive restarts). */
export const useUpdateProperty = () =>
  useMutation<PropertyDetailsDto, Error, UpdatePropertyVariables>({
    mutationKey: propertyMutationKeys.update,
  });
