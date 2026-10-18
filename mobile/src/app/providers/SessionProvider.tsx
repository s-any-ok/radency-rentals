import { PropsWithChildren, useEffect } from 'react';

import { restoreSession } from 'src/entities/session';
import { queryClient, queryPersister } from 'src/shared/config';
import { resetVersionChains } from 'src/shared/lib';
import {
  useApplicationFiltersStore,
  useSessionStatus,
  useSessionStore,
  useSyncStore,
} from 'src/shared/model';
import { LoadingState } from 'src/shared/ui';

/** Wipes everything that belonged to the previous user (cached data, queued changes, UI state). */
const wipeUserData = () => {
  queryClient.cancelQueries();
  queryClient.getMutationCache().clear();
  queryClient.clear();
  void queryPersister.removeClient();
  resetVersionChains();
  useSyncStore.getState().clearRejected();
  useApplicationFiltersStore.getState().reset();
};

export const SessionProvider = ({ children }: PropsWithChildren) => {
  const status = useSessionStatus();

  useEffect(() => {
    void restoreSession();

    // Any transition to signed-out (logout, refresh token rejected) clears the previous user's data.
    return useSessionStore.subscribe((state, previous) => {
      if (previous.status === 'signedIn' && state.status === 'signedOut') {
        wipeUserData();
      }
    });
  }, []);

  if (status === 'restoring') return <LoadingState />;

  return <>{children}</>;
};
