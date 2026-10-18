import NetInfo from '@react-native-community/netinfo';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { Mutation, MutationCache, onlineManager, QueryClient } from '@tanstack/react-query';

import { isNetworkError, toApiError } from '../api';
import { queryCacheStorage } from '../lib/storage';
import { useNetworkStore, useSyncStore } from '../model';
import { isNetworkConnected } from './netinfo';

const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_NETWORK_RETRIES = 3;

/** How long persisted data is kept on the device. */
export const PERSIST_MAX_AGE = 7 * DAY_MS;

/** All changes run one after another in creation order, so e.g. "create property" replays before "add unit". */
export const OFFLINE_QUEUE_SCOPE = { id: 'offline-queue' } as const;

/** Every mutation's variables carry a human description used when reporting a rejected change. */
export type DescribedVariables = { description?: string };

/** Ids of mutations that were queued (paused) at some point, i.e. the user didn't see them fail inline. */
const queuedMutationIds = new Set<number>();

const reportRejectedIfQueued = (
  error: unknown,
  variables: unknown,
  mutation: Mutation<unknown, unknown, unknown, unknown>,
) => {
  if (!queuedMutationIds.has(mutation.mutationId)) return;
  queuedMutationIds.delete(mutation.mutationId);

  const description = (variables as DescribedVariables | undefined)?.description ?? 'A change';
  const apiError = toApiError(error);
  useSyncStore.getState().addRejected({
    title: description,
    message: apiError.isRejection ? apiError.message : "Couldn't sync this change with the server.",
  });
};

export const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onError: (error, variables, _onMutateResult, mutation) =>
      reportRejectedIfQueued(error, variables, mutation),
    onSuccess: (_data, _variables, _onMutateResult, mutation) => {
      queuedMutationIds.delete(mutation.mutationId);
    },
  }),
  defaultOptions: {
    queries: {
      // Must be at least the persister's maxAge, otherwise data is dropped before it is saved.
      gcTime: PERSIST_MAX_AGE,
      staleTime: 30 * 1000,
      retry: (failureCount, error) => isNetworkError(error) && failureCount < 2,
      refetchOnReconnect: true,
    },
    mutations: {
      // Rejections (4xx) are final; only transport failures are retried.
      retry: (failureCount, error) => isNetworkError(error) && failureCount < MAX_NETWORK_RETRIES,
      scope: OFFLINE_QUEUE_SCOPE,
    },
  },
});

export const queryPersister = createSyncStoragePersister({
  storage: queryCacheStorage,
  key: 'rentals-query-cache',
  throttleTime: 1000,
});

/**
 * Wires NetInfo to TanStack Query's onlineManager (paused queries/mutations resume on reconnect)
 * and mirrors connectivity into the network store for the UI.
 * Must run after initializeNetInfo().
 */
export const initializeQueryNetwork = () => {
  onlineManager.setEventListener((setOnline) =>
    NetInfo.addEventListener((state) => {
      const online = isNetworkConnected(state);
      useNetworkStore.getState().setOnline(online);
      setOnline(online);
    }),
  );
};

/** Keeps the sync store's pending count in step with the mutation queue and tracks queued changes. */
export const observeMutationQueue = (client: QueryClient) => {
  const cache = client.getMutationCache();

  const update = () => {
    const pending = cache.getAll().filter((m) => m.state.status === 'pending').length;
    useSyncStore.getState().setPendingCount(pending);
  };

  const unsubscribe = cache.subscribe((event) => {
    // Observer events fire synchronously while a component renders (useMutation sets up its
    // observer during render). They never change a mutation's state, and updating a store from
    // them would make React warn about updating another component during render.
    if (
      event.type === 'observerAdded' ||
      event.type === 'observerRemoved' ||
      event.type === 'observerOptionsUpdated'
    ) {
      return;
    }
    const mutation = event.mutation;
    if (mutation?.state.isPaused) {
      // Either paused just now (offline) or restored as paused from storage after a restart.
      queuedMutationIds.add(mutation.mutationId);
    }
    if (event.type === 'removed' && mutation) {
      queuedMutationIds.delete(mutation.mutationId);
    }
    update();
  });

  update();
  return unsubscribe;
};
