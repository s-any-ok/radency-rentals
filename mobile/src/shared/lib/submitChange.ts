import { onlineManager } from '@tanstack/react-query';

export type ChangeOutcome = 'saved' | 'queued';

type MutationLike<TVariables> = {
  mutate: (variables: TVariables) => void;
  mutateAsync: (variables: TVariables) => Promise<unknown>;
};

/**
 * Online: waits for the server so validation errors can be shown next to the fields.
 * Offline: queues the change (TanStack Query pauses it and replays it on reconnect) and
 * returns immediately — the optimistic update already shows the result.
 */
export const submitChange = async <TVariables>(
  mutation: MutationLike<TVariables>,
  variables: TVariables,
): Promise<ChangeOutcome> => {
  if (!onlineManager.isOnline()) {
    mutation.mutate(variables);
    return 'queued';
  }
  await mutation.mutateAsync(variables);
  return 'saved';
};
