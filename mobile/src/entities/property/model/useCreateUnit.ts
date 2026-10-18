import { useMutation } from '@tanstack/react-query';

import { propertyMutationKeys } from '../keys';
import { CreateUnitVariables, UnitDto } from '../types';

/** Logic is registered once in registerPropertyMutations (so offline-queued changes survive restarts). */
export const useCreateUnit = () =>
  useMutation<UnitDto, Error, CreateUnitVariables>({
    mutationKey: propertyMutationKeys.createUnit,
  });
