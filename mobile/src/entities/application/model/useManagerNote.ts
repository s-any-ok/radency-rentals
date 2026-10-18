import { useQuery } from '@tanstack/react-query';

import { applicationApi } from '../api';
import { applicationKeys } from '../keys';

/** Internal notes; property managers only (the API never returns them to applicants). */
export const useManagerNote = (id: string, enabled: boolean) =>
  useQuery({
    queryKey: applicationKeys.note(id),
    queryFn: () => applicationApi.getNote(id),
    enabled,
  });
