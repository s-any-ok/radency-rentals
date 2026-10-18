import { View } from 'react-native';

import { APPLICATION_STATUS_META, useApplicationHistory } from 'src/entities/application';
import { formatDateTime } from 'src/shared/lib';
import { Badge, Card, Text } from 'src/shared/ui';

import { StatusHistorySkeleton } from './StatusHistorySkeleton';

type Props = { applicationId: string };

/** Who changed the status, when, and with which review outcome/comment. */
export const StatusHistory = ({ applicationId }: Props) => {
  const { data: history, isLoading } = useApplicationHistory(applicationId, true);

  return (
    <Card>
      <Text
        variant="heading"
        className="mb-3"
      >
        History
      </Text>
      {isLoading ? <StatusHistorySkeleton /> : null}
      {history?.map((entry, index) => (
        <View
          key={entry.id}
          className="flex-row"
        >
          <View className="mr-3 items-center">
            <View className="mt-1.5 h-2.5 w-2.5 rounded-full bg-primary-500" />
            {index < history.length - 1 && <View className="w-0.5 flex-1 bg-ink-200" />}
          </View>
          <View className="flex-1 pb-4">
            <View className="flex-row flex-wrap items-center gap-2">
              <Badge
                label={APPLICATION_STATUS_META[entry.toStatus].label}
                tone={APPLICATION_STATUS_META[entry.toStatus].tone}
              />
              {entry.outcome ? <Text variant="caption">Review: {entry.outcome}</Text> : null}
            </View>
            <Text
              variant="caption"
              className="mt-1"
            >
              {entry.changedBy} · {formatDateTime(entry.changedAt)}
            </Text>
            {entry.comment ? (
              <Text className="mt-1 text-sm text-ink-700">“{entry.comment}”</Text>
            ) : null}
          </View>
        </View>
      ))}
    </Card>
  );
};
