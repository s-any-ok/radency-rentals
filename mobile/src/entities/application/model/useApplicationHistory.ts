import { useQuery } from '@tanstack/react-query';

import { applicationApi } from '../api';
import { applicationKeys } from '../keys';

/** Status changes and review outcomes; property managers only. */
export const useApplicationHistory = (id: string, enabled: boolean) =>
  useQuery({
    queryKey: applicationKeys.history(id),
    queryFn: () => applicationApi.history(id),
    enabled,
  });
