import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { zustandStorage } from '../../lib/storage';

export type SortDirection = 'Asc' | 'Desc';

export type ApplicationFilters = {
  /** ApplicationStatus or null for "all". Typed as string here because shared can't import entities. */
  status: string | null;
  propertyId: string | null;
  sortBy: string;
  sortDirection: SortDirection;
  page: number;
  pageSize: number;
};

type ApplicationFiltersStore = ApplicationFilters & {
  setStatus: (status: string | null) => void;
  setPropertyId: (propertyId: string | null) => void;
  setSort: (sortBy: string, sortDirection: SortDirection) => void;
  setPage: (page: number) => void;
  reset: () => void;
};

const initialFilters: ApplicationFilters = {
  status: null,
  propertyId: null,
  sortBy: 'UpdatedAt',
  sortDirection: 'Desc',
  page: 1,
  pageSize: 10,
};

/** Filters/sort/page of the application list (UI state, remembered between launches). */
export const useApplicationFiltersStore = create<ApplicationFiltersStore>()(
  persist(
    (set) => ({
      ...initialFilters,
      // Changing a filter or the sort always goes back to the first page.
      setStatus: (status) => set({ status, page: 1 }),
      setPropertyId: (propertyId) => set({ propertyId, page: 1 }),
      setSort: (sortBy, sortDirection) => set({ sortBy, sortDirection, page: 1 }),
      setPage: (page) => set({ page }),
      reset: () => set(initialFilters),
    }),
    {
      name: 'application-filters',
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);
