import { useMutation } from '@tanstack/react-query';

import { propertyMutationKeys } from '../keys';
import { UnitDto, UpdateUnitVariables } from '../types';

/** Logic is registered once in registerPropertyMutations (so offline-queued changes survive restarts). */
export const useUpdateUnit = () =>
  useMutation<UnitDto, Error, UpdateUnitVariables>({
    mutationKey: propertyMutationKeys.updateUnit,
  });
