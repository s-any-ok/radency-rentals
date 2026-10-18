import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { applicationApi } from '../api';
import { applicationKeys } from '../keys';
import { ApplicationListParams } from '../types';

/** One page of the list; filters, sorting and paging are applied by the server. */
export const useApplications = (params: ApplicationListParams) =>
  useQuery({
    queryKey: applicationKeys.list(params),
    queryFn: () => applicationApi.list(params),
    placeholderData: keepPreviousData,
  });
