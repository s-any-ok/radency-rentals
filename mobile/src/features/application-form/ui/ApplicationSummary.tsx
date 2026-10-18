import { View } from 'react-native';

import type { ApplicationDto } from 'src/entities/application';
import { formatDate } from 'src/shared/lib';
import { Badge, Card, KeyValueRow, Text } from 'src/shared/ui';

type Props = { application: ApplicationDto };

/** Read-only view of both saved sections, as they will be submitted. */
export const ApplicationSummary = ({ application }: Props) => {
  const { applicantInfo, residences } = application;

  return (
    <View className="gap-4">
      <Card>
        <View className="mb-2 flex-row items-center justify-between">
          <Text variant="heading">Applicant information</Text>
          <Badge
            label={application.applicantInfoCompleted ? 'Saved' : 'Not saved'}
            tone={application.applicantInfoCompleted ? 'success' : 'warning'}
          />
        </View>
        <KeyValueRow
          label="Name"
          value={applicantInfo?.fullName}
        />
        <KeyValueRow
          label="Phone"
          value={applicantInfo?.phone}
        />
        <KeyValueRow
          label="Email"
          value={applicantInfo?.email}
        />
        <KeyValueRow
          label="Current address"
          value={applicantInfo?.currentAddress}
        />
      </Card>

      <Card>
        <View className="mb-2 flex-row items-center justify-between">
          <Text variant="heading">Residence history</Text>
          <Badge
            label={application.residenceHistoryCompleted ? 'Saved' : 'Not saved'}
            tone={application.residenceHistoryCompleted ? 'success' : 'warning'}
          />
        </View>
        {residences.length === 0 ? (
          <Text tone="muted">No residences saved.</Text>
        ) : (
          residences.map((residence, index) => (
            <View
              key={`${residence.address}-${index}`}
              className="border-b border-ink-100 py-2.5"
            >
              <Text className="font-semibold text-ink-900">{residence.address}</Text>
              <Text variant="caption">
                {formatDate(residence.moveInDate)} – {formatDate(residence.moveOutDate)} · Landlord{' '}
                {residence.landlordName}, {residence.landlordPhone}
              </Text>
            </View>
          ))
        )}
      </Card>
    </View>
  );
};
