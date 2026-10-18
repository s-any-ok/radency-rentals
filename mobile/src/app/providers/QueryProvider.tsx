import { focusManager } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { PropsWithChildren, useCallback } from 'react';
import { AppStateStatus } from 'react-native';

import { PERSIST_MAX_AGE, queryClient, queryPersister } from 'src/shared/config';
import { useAppState } from 'src/shared/lib';

const persistOptions = {
  persister: queryPersister,
  maxAge: PERSIST_MAX_AGE,
  dehydrateOptions: {
    // Successful queries are kept for offline start; paused (queued) mutations are kept by default.
    shouldDehydrateQuery: (query: { state: { status: string } }) =>
      query.state.status === 'success',
  },
};

/**
 * Restores the persisted cache (data + queued changes) from device storage, then resumes the
 * queued changes. If the device is still offline they stay paused and run on reconnect.
 */
const handleRestored = () => {
  void queryClient.resumePausedMutations().then(() => queryClient.invalidateQueries());
};

export const QueryProvider = ({ children }: PropsWithChildren) => {
  useAppState(
    useCallback((status: AppStateStatus) => {
      focusManager.setFocused(status === 'active');
    }, []),
  );

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={persistOptions}
      onSuccess={handleRestored}
    >
      {children}
    </PersistQueryClientProvider>
  );
};
