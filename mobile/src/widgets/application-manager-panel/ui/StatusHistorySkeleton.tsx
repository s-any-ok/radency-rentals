import { View } from 'react-native';

import { Skeleton, SkeletonPulse } from 'src/shared/ui';

const ENTRIES = 3;

/** Timeline placeholder with the same rhythm as the history entries (dot, status pill, caption). */
export const StatusHistorySkeleton = () => (
  <SkeletonPulse>
    {Array.from({ length: ENTRIES }, (_, index) => (
      <View
        key={index}
        className="flex-row pb-4"
      >
        <Skeleton className="mr-3 mt-1.5 h-2.5 w-2.5 rounded-full" />
        <View className="flex-1">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="mt-2 h-3 w-1/2" />
        </View>
      </View>
    ))}
  </SkeletonPulse>
);
