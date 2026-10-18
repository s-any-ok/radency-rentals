import { useQuery } from '@tanstack/react-query';

import { propertyApi } from '../api';
import { propertyKeys } from '../keys';

export const useAvailableUnits = () =>
  useQuery({
    queryKey: propertyKeys.availableUnits(),
    queryFn: () => propertyApi.availableUnits(),
  });
