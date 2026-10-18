import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';

import { PropertyList } from 'src/widgets/property-list';
import { SyncStatus } from 'src/widgets/sync-status';
import { AppNavigation, ROUTE } from 'src/shared/config';
import { ScreenContainer, ScreenHeader } from 'src/shared/ui';

export const PropertiesScreen = () => {
  const { navigate } = useNavigation<AppNavigation>();
  const openProperty = useCallback(
    (propertyId: string) => navigate(ROUTE.PROPERTY_DETAILS, { propertyId }),
    [navigate],
  );

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Properties"
        subtitle="Your buildings and their units"
      />
      <SyncStatus />
      <PropertyList onOpenProperty={openProperty} />
    </ScreenContainer>
  );
};
