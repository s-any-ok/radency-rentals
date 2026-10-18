import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';

import { PropertyUnits } from 'src/widgets/property-units';
import { SyncStatus } from 'src/widgets/sync-status';
import { AppNavigation, AppStackParamList, ROUTE } from 'src/shared/config';
import { ScreenContainer, ScreenHeader } from 'src/shared/ui';

export const PropertyDetailsScreen = () => {
  const { goBack } = useNavigation<AppNavigation>();
  const { params } = useRoute<RouteProp<AppStackParamList, ROUTE.PROPERTY_DETAILS>>();

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Property"
        onBack={goBack}
      />
      <SyncStatus />
      <PropertyUnits
        propertyId={params.propertyId}
        onPropertyDeleted={goBack}
      />
    </ScreenContainer>
  );
};
