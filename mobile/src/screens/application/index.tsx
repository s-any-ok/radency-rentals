import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useCallback } from 'react';
import { ScrollView, View } from 'react-native';

import { ApplicationManagerPanel } from 'src/widgets/application-manager-panel';
import { ApplicationOverview } from 'src/widgets/application-overview';
import { ApplicationWizard } from 'src/widgets/application-wizard';
import { SyncStatus } from 'src/widgets/sync-status';
import { WithdrawButton } from 'src/features/withdraw-application';
import { useApplication } from 'src/entities/application';
import { getErrorMessage } from 'src/shared/api';
import { AppNavigation, AppStackParamList, ROUTE } from 'src/shared/config';
import { useIsPropertyManager } from 'src/shared/model';
import {
  ErrorState,
  LoadingState,
  PullToRefresh,
  ScreenContainer,
  ScreenHeader,
} from 'src/shared/ui';

export const ApplicationScreen = () => {
  const { goBack } = useNavigation<AppNavigation>();
  const { params } = useRoute<RouteProp<AppStackParamList, ROUTE.APPLICATION>>();
  const isManager = useIsPropertyManager();
  const { data: application, isLoading, error, refetch } = useApplication(params.applicationId);
  const retry = useCallback(() => void refetch(), [refetch]);

  return (
    <ScreenContainer edges={['top', 'bottom']}>
      <ScreenHeader
        title="Rental application"
        onBack={goBack}
      />
      <SyncStatus />
      {isLoading ? (
        <LoadingState />
      ) : !application ? (
        <ErrorState
          message={error ? getErrorMessage(error) : 'Application not found.'}
          onRetry={retry}
        />
      ) : (
        <ScrollView
          // iOS: insets the content by the keyboard height and scrolls the focused input
          // into view (wizard fields, review comment, notes). Android resizes the window instead.
          automaticallyAdjustKeyboardInsets
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="pb-10"
          refreshControl={<PullToRefresh onRefresh={refetch} />}
        >
          <ApplicationOverview application={application} />
          <ApplicationWizard
            // A new id means a different application: start a fresh form.
            key={application.id}
            application={application}
          />
          <WithdrawButton application={application} />
          {isManager ? (
            <View className="mt-4">
              <ApplicationManagerPanel application={application} />
            </View>
          ) : null}
        </ScrollView>
      )}
    </ScreenContainer>
  );
};
