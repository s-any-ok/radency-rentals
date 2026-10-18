import { useQuery } from '@tanstack/react-query';

import { propertyApi } from '../api';
import { propertyKeys } from '../keys';

export const useProperties = () =>
  useQuery({
    queryKey: propertyKeys.list(),
    queryFn: propertyApi.list,
  });
