import { View } from 'react-native';

import { APPLICATION_STATUS_META, type ApplicationDto } from 'src/entities/application';
import { formatCurrency, formatDate } from 'src/shared/lib';
import { Badge, Banner, Card, Text } from 'src/shared/ui';

type Props = { application: ApplicationDto };

/** Unit, status and outcome (lease / review comment) at the top of the application page. */
export const ApplicationOverview = ({ application }: Props) => {
  const { unit, status, lease, lastReviewComment } = application;
  const meta = APPLICATION_STATUS_META[status];

  return (
    <View className="gap-3 px-4 pb-4">
      <Card>
        <View className="flex-row items-start justify-between">
          <View className="flex-1 pr-3">
            <Text variant="heading">
              {unit.propertyName} · Unit {unit.unitNumber}
            </Text>
            <Text variant="caption">{unit.propertyAddress}</Text>
            <Text
              variant="caption"
              className="mt-1"
            >
              {unit.unitTypeName} · {unit.bedrooms === 0 ? 'Studio' : `${unit.bedrooms} bd`} ·{' '}
              {formatCurrency(unit.monthlyRent)}/mo
            </Text>
          </View>
          <Badge
            label={meta.label}
            tone={meta.tone}
          />
        </View>
        <Text
          variant="caption"
          className="mt-3"
        >
          Applicant: {application.applicantName}
          {application.submittedAt ? ` · submitted ${formatDate(application.submittedAt)}` : ''}
        </Text>
      </Card>

      {status === 'Returned' && lastReviewComment ? (
        <Banner
          tone="warning"
          icon="arrow-undo-outline"
          title="Returned for corrections"
          message={lastReviewComment}
        />
      ) : null}
      {status === 'Denied' && lastReviewComment ? (
        <Banner
          tone="danger"
          icon="close-circle-outline"
          title="Application denied"
          message={lastReviewComment}
        />
      ) : null}
      {lease ? (
        <Banner
          tone="info"
          icon="key-outline"
          title="Lease issued"
          message={`12-month lease from ${formatDate(lease.startDate)} to ${formatDate(lease.endDate)}.`}
        />
      ) : null}
    </View>
  );
};
