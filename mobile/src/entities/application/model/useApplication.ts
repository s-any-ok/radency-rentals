import { useQuery } from '@tanstack/react-query';

import { applicationApi } from '../api';
import { applicationKeys } from '../keys';

export const useApplication = (id: string) =>
  useQuery({
    queryKey: applicationKeys.detail(id),
    queryFn: () => applicationApi.get(id),
  });
