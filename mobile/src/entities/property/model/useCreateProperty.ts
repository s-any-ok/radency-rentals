import { useMutation } from '@tanstack/react-query';

import { propertyMutationKeys } from '../keys';
import { CreatePropertyVariables, PropertyDetailsDto } from '../types';

/** Logic is registered once in registerPropertyMutations (so offline-queued changes survive restarts). */
export const useCreateProperty = () =>
  useMutation<PropertyDetailsDto, Error, CreatePropertyVariables>({
    mutationKey: propertyMutationKeys.create,
  });
