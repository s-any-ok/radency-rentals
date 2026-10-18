import { create } from 'zustand';

export type RejectedChange = {
  id: string;
  /** What the user tried to do, e.g. "Update unit 101". */
  title: string;
  /** Why the server refused it. */
  message: string;
  at: number;
};

type SyncStore = {
  /** Changes made (possibly offline) that the server hasn't confirmed yet. */
  pendingCount: number;
  rejected: RejectedChange[];
  setPendingCount: (count: number) => void;
  addRejected: (change: Omit<RejectedChange, 'id' | 'at'>) => void;
  dismissRejected: (id: string) => void;
  clearRejected: () => void;
};

/** Sync status of the offline change queue (client state; the queue itself lives in TanStack Query). */
export const useSyncStore = create<SyncStore>((set) => ({
  pendingCount: 0,
  rejected: [],
  setPendingCount: (pendingCount) =>
    set((state) => (state.pendingCount === pendingCount ? state : { pendingCount })),
  addRejected: (change) =>
    set((state) => ({
      rejected: [
        ...state.rejected,
        { ...change, id: `${Date.now()}-${state.rejected.length}`, at: Date.now() },
      ],
    })),
  dismissRejected: (id) =>
    set((state) => ({ rejected: state.rejected.filter((c) => c.id !== id) })),
  clearRejected: () => set({ rejected: [] }),
}));

export const usePendingCount = () => useSyncStore((s) => s.pendingCount);
export const useRejectedChanges = () => useSyncStore((s) => s.rejected);
