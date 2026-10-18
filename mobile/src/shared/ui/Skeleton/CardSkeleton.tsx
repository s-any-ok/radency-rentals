import { View } from 'react-native';

import { Card } from '../Card';
import { Skeleton } from './Skeleton';

/** Same footprint as the list cards (title, caption, a row of badges). */
export const CardSkeleton = () => (
  <Card className="mx-4 mb-3">
    <Skeleton className="h-5 w-3/5" />
    <Skeleton className="mt-2 h-3 w-2/5" />
    <View className="mt-3 flex-row gap-2">
      <Skeleton className="h-6 w-16 rounded-full" />
      <Skeleton className="h-6 w-20 rounded-full" />
    </View>
  </Card>
);
