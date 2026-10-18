import { View } from 'react-native';

import { cn } from '../../lib/cn';

type Props = { className?: string };

/** A grey placeholder block; its size and shape come from className. Put it inside SkeletonPulse. */
export const Skeleton = ({ className }: Props) => (
  <View className={cn('rounded-md bg-ink-200', className)} />
);
