import { create } from 'zustand';

type NetworkStore = {
  isOnline: boolean;
  setOnline: (isOnline: boolean) => void;
};

/** Connectivity as reported by NetInfo (client state). */
export const useNetworkStore = create<NetworkStore>((set) => ({
  isOnline: true,
  setOnline: (isOnline) => set({ isOnline }),
}));

export const useIsOnline = () => useNetworkStore((s) => s.isOnline);
