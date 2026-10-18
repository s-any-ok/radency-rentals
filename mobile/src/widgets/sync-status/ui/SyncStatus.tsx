import { SyncStatusBanner } from 'src/features/network-status';
import { RejectedChangesBanner } from 'src/features/sync-errors';

/** Offline state, pending sync count and rejected queued changes. Shown on every main screen. */
export const SyncStatus = () => (
  <>
    <SyncStatusBanner />
    <RejectedChangesBanner />
  </>
);
