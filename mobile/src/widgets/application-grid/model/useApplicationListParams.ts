import { useShallow } from 'zustand/react/shallow';

import type {
  ApplicationListParams,
  ApplicationSortField,
  ApplicationStatus,
} from 'src/entities/application';
import { useApplicationFiltersStore } from 'src/shared/model';

/** Turns the filters store (client state) into the list query params (server state key). */
export const useApplicationListParams = (): ApplicationListParams =>
  useApplicationFiltersStore(
    useShallow((s) => ({
      status: s.status as ApplicationStatus | null,
      propertyId: s.propertyId,
      page: s.page,
      pageSize: s.pageSize,
      sortBy: s.sortBy as ApplicationSortField,
      sortDirection: s.sortDirection,
    })),
  );
