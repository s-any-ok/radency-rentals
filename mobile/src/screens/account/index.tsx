import { View } from 'react-native';

import { SyncStatus } from 'src/widgets/sync-status';
import { LogoutButton } from 'src/features/logout';
import { API_URL } from 'src/shared/config';
import { useIsOnline, usePendingCount, useSessionUser } from 'src/shared/model';
import { Card, KeyValueRow, ScreenContainer, ScreenHeader, Text } from 'src/shared/ui';

export const AccountScreen = () => {
  const user = useSessionUser();
  const isOnline = useIsOnline();
  const pendingCount = usePendingCount();

  return (
    <ScreenContainer>
      <ScreenHeader title="Account" />
      <SyncStatus />
      <View className="gap-4 px-4">
        <Card>
          <Text variant="heading">{user?.fullName}</Text>
          <Text tone="muted">{user?.email}</Text>
          <View className="mt-3">
            <KeyValueRow
              label="Role"
              value={user?.role === 'PropertyManager' ? 'Property manager' : 'Applicant'}
            />
            <KeyValueRow
              label="Connection"
              value={isOnline ? 'Online' : 'Offline'}
            />
            <KeyValueRow
              label="Changes waiting to sync"
              value={pendingCount}
            />
            <KeyValueRow
              label="Server"
              value={API_URL}
            />
          </View>
        </Card>
        <LogoutButton />
      </View>
    </ScreenContainer>
  );
};
