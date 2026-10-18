import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';

import { ApplicationGrid } from 'src/widgets/application-grid';
import { SyncStatus } from 'src/widgets/sync-status';
import { AppNavigation, ROUTE } from 'src/shared/config';
import { useIsPropertyManager } from 'src/shared/model';
import { ScreenContainer, ScreenHeader } from 'src/shared/ui';

export const ApplicationsScreen = () => {
  const { navigate } = useNavigation<AppNavigation>();
  const isManager = useIsPropertyManager();
  const openApplication = useCallback(
    (applicationId: string) => navigate(ROUTE.APPLICATION, { applicationId }),
    [navigate],
  );

  return (
    <ScreenContainer>
      <ScreenHeader
        title={isManager ? 'Applications' : 'My applications'}
        subtitle={isManager ? 'Review and decide' : 'Track your rental applications'}
      />
      <SyncStatus />
      <ApplicationGrid onOpen={openApplication} />
    </ScreenContainer>
  );
};
