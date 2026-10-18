import { View } from 'react-native';

import { ManagerNotesCard } from 'src/features/manager-notes';
import { ReviewButton } from 'src/features/review-application';
import type { ApplicationDto } from 'src/entities/application';

import { StatusHistory } from './StatusHistory';

type Props = { application: ApplicationDto };

/** Property-manager-only part of the application page. */
export const ApplicationManagerPanel = ({ application }: Props) => (
  <View className="gap-3 px-4">
    <ReviewButton application={application} />
    <StatusHistory applicationId={application.id} />
    <ManagerNotesCard applicationId={application.id} />
  </View>
);
