import { useCallback, useState } from 'react';

import { clearSession, sessionApi } from 'src/entities/session';
import { useNetworkStore } from 'src/shared/model';

export const useLogout = () => {
  const [isPending, setIsPending] = useState(false);

  const logout = useCallback(async () => {
    setIsPending(true);
    try {
      // Best effort: revokes refresh tokens on the server. Never blocks signing out.
      if (useNetworkStore.getState().isOnline) {
        await sessionApi.signOut().catch(() => undefined);
      }
    } finally {
      // Clearing the session also wipes cached data and the offline queue (see SessionProvider).
      await clearSession();
      setIsPending(false);
    }
  }, []);

  return { logout, isPending };
};
