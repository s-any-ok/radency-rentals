import { useQuery } from '@tanstack/react-query';

import { propertyApi } from '../api';
import { propertyKeys } from '../keys';

const UNIT_TYPES_STALE_MS = 60 * 60 * 1000;

export const useUnitTypes = () =>
  useQuery({
    queryKey: propertyKeys.unitTypes(),
    queryFn: propertyApi.unitTypes,
    staleTime: UNIT_TYPES_STALE_MS,
  });
