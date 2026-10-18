import { View } from 'react-native';

import { useRejectedChanges, useSyncStore } from 'src/shared/model';
import { Banner, IconButton } from 'src/shared/ui';
import { colors } from 'src/shared/const';

/** Shows queued changes the server refused once they were replayed (conflicts, rule violations). */
export const RejectedChangesBanner = () => {
  const rejected = useRejectedChanges();
  const dismiss = useSyncStore((s) => s.dismissRejected);

  if (rejected.length === 0) return null;

  return (
    <View className="mx-4 mb-2 gap-2">
      {rejected.map((change) => (
        <Banner
          key={change.id}
          tone="danger"
          icon="alert-circle"
          title={`Not saved: ${change.title}`}
          message={change.message}
          action={
            <IconButton
              icon="close"
              size={18}
              color={colors.danger[700]}
              accessibilityLabel="Dismiss"
              onPress={() => dismiss(change.id)}
              className="-mr-2 -mt-2"
            />
          }
        />
      ))}
    </View>
  );
};
