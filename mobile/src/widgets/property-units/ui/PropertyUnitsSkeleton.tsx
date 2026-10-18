import { View } from 'react-native';

import { Card, CardListSkeleton, Skeleton } from 'src/shared/ui';

/** Loading layout of the property page: details card, "Units" header row, unit cards. */
export const PropertyUnitsSkeleton = () => (
  <CardListSkeleton
    count={3}
    header={
      <>
        <Card className="mx-4 mb-4">
          <Skeleton className="h-5 w-3/5" />
          <Skeleton className="mt-2 h-3 w-4/5" />
          <View className="mt-3 flex-row gap-2">
            <Skeleton className="h-9 w-20 rounded-lg" />
            <Skeleton className="h-9 w-24 rounded-lg" />
          </View>
        </Card>
        <View className="mb-3 flex-row items-center justify-between px-4">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-9 w-24 rounded-lg" />
        </View>
      </>
    }
  />
);
