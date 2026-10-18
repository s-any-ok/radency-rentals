import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { zustandStorage } from '../../lib/storage';

export type UserRole = 'Applicant' | 'PropertyManager';

export type SessionUser = {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
};

export type SessionTokens = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
};

/**
 * restoring  – reading tokens from secure storage on app start
 * signedIn   – tokens present (works offline too: we never sign out because of a network error)
 * signedOut  – no session
 */
export type SessionStatus = 'restoring' | 'signedIn' | 'signedOut';

type SessionStore = {
  status: SessionStatus;
  tokens: SessionTokens | null;
  user: SessionUser | null;
  restore: (tokens: SessionTokens | null) => void;
  setTokens: (tokens: SessionTokens) => void;
  setUser: (user: SessionUser) => void;
  clear: () => void;
};

/**
 * Auth session (client state). Tokens are kept in memory here and persisted separately in
 * secure storage; only the non-sensitive user profile is persisted to MMKV so the app knows
 * the user's role when it starts offline.
 */
export const useSessionStore = create<SessionStore>()(
  persist(
    (set) => ({
      status: 'restoring',
      tokens: null,
      user: null,
      restore: (tokens) =>
        set((state) => ({
          tokens,
          status: tokens ? 'signedIn' : 'signedOut',
          user: tokens ? state.user : null,
        })),
      setTokens: (tokens) => set({ tokens, status: 'signedIn' }),
      setUser: (user) => set({ user }),
      clear: () => set({ tokens: null, user: null, status: 'signedOut' }),
    }),
    {
      name: 'session',
      storage: createJSONStorage(() => zustandStorage),
      partialize: ({ user }) => ({ user }),
    },
  ),
);

export const useSessionStatus = () => useSessionStore((s) => s.status);
export const useSessionUser = () => useSessionStore((s) => s.user);
export const useIsPropertyManager = () =>
  useSessionStore((s) => s.user?.role === 'PropertyManager');
