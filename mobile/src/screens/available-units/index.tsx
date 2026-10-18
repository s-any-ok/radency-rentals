import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';

import { AvailableUnitList } from 'src/widgets/available-units';
import { SyncStatus } from 'src/widgets/sync-status';
import { AppNavigation, ROUTE } from 'src/shared/config';
import { ScreenContainer, ScreenHeader } from 'src/shared/ui';

export const AvailableUnitsScreen = () => {
  const { navigate } = useNavigation<AppNavigation>();
  const openApplication = useCallback(
    (applicationId: string) => navigate(ROUTE.APPLICATION, { applicationId }),
    [navigate],
  );

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Find a home"
        subtitle="Units available right now"
      />
      <SyncStatus />
      <AvailableUnitList onApplicationStarted={openApplication} />
    </ScreenContainer>
  );
};
