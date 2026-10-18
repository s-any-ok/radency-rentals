/**
 * Optimistic-concurrency helper for queued offline changes.
 *
 * Every change carries the version the user saw when making it. When several changes to the same
 * record are queued while offline, they all carry that same base version; once the first one is
 * replayed the server returns a new version and the next queued change would look stale.
 * This chain remembers "version A was replaced by B because of OUR change", so later queued
 * changes are rebased onto our own result — but a change made by someone else (not in the chain)
 * is still detected by the server as a conflict.
 */
const chains = new Map<string, Map<string, string>>();

export const recordVersion = (entityId: string, sentVersion: string, newVersion: string): void => {
  const chain = chains.get(entityId) ?? new Map<string, string>();
  chain.set(sentVersion, newVersion);
  chains.set(entityId, chain);
};

export const resolveVersion = (entityId: string, version: string): string => {
  const chain = chains.get(entityId);
  if (!chain) return version;

  let current = version;
  const seen = new Set<string>();
  while (chain.has(current) && !seen.has(current)) {
    seen.add(current);
    current = chain.get(current)!;
  }
  return current;
};

export const resetVersionChains = (): void => chains.clear();
