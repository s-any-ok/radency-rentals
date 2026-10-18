import { useQuery } from '@tanstack/react-query';

import { propertyApi } from '../api';
import { propertyKeys } from '../keys';

export const useProperty = (id: string) =>
  useQuery({
    queryKey: propertyKeys.detail(id),
    queryFn: () => propertyApi.get(id),
  });
