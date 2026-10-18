import { useIsOnline, usePendingCount } from 'src/shared/model';
import { Banner } from 'src/shared/ui';

const plural = (count: number) => (count === 1 ? '1 change' : `${count} changes`);

/** Tells the user when they're offline and how many changes are waiting to sync. */
export const SyncStatusBanner = () => {
  const isOnline = useIsOnline();
  const pendingCount = usePendingCount();

  if (!isOnline) {
    return (
      <Banner
        tone="warning"
        icon="cloud-offline-outline"
        title="You're offline"
        message={
          pendingCount > 0
            ? `${plural(pendingCount)} waiting to sync. They'll be sent when you're back online.`
            : 'Showing saved data. Changes you make will sync when you reconnect.'
        }
        className="mx-4 mb-2"
      />
    );
  }

  if (pendingCount > 0) {
    return (
      <Banner
        tone="info"
        icon="sync-outline"
        message={`Syncing ${plural(pendingCount)}…`}
        className="mx-4 mb-2"
      />
    );
  }

  return null;
};
