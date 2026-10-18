import type { BadgeTone } from 'src/shared/ui';

import { ApplicationStatus } from '../types';

export const APPLICATION_STATUS_META: Record<
  ApplicationStatus,
  { label: string; tone: BadgeTone }
> = {
  Draft: { label: 'Draft', tone: 'neutral' },
  Submitted: { label: 'Submitted', tone: 'info' },
  Returned: { label: 'Returned', tone: 'warning' },
  Approved: { label: 'Approved', tone: 'success' },
  Denied: { label: 'Denied', tone: 'danger' },
  Withdrawn: { label: 'Withdrawn', tone: 'neutral' },
};
