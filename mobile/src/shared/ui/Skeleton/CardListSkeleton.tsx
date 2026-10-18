import { ReactNode } from 'react';

import { CardSkeleton } from './CardSkeleton';
import { SkeletonPulse } from './SkeletonPulse';

type Props = {
  count?: number;
  /** Placeholder for content above the cards (e.g. a details card); pulses together with them. */
  header?: ReactNode;
};

/** Loading placeholder for card lists: render it where the list items go, keep real headers. */
export const CardListSkeleton = ({ count = 4, header }: Props) => (
  <SkeletonPulse>
    {header}
    {Array.from({ length: count }, (_, index) => (
      <CardSkeleton key={index} />
    ))}
  </SkeletonPulse>
);
