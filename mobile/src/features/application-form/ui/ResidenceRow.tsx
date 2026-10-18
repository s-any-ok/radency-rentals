import { memo } from 'react';
import { View } from 'react-native';

import type { Residence } from 'src/entities/application';
import { colors } from 'src/shared/const';
import { formatDate } from 'src/shared/lib';
import { Card, IconButton, Text } from 'src/shared/ui';

type Props = {
  residence: Residence;
  index: number;
  error?: string;
  readOnly: boolean;
  onEdit: (index: number) => void;
  onRemove: (index: number) => void;
};

export const ResidenceRow = memo(
  ({ residence, index, error, readOnly, onEdit, onRemove }: Props) => (
    <Card className={error ? 'mb-3 border-danger-500' : 'mb-3'}>
      <View className="flex-row items-start">
        <View className="flex-1">
          <Text className="font-semibold text-ink-900">{residence.address}</Text>
          <Text variant="caption">
            {formatDate(residence.moveInDate)} – {formatDate(residence.moveOutDate)}
          </Text>
          <Text
            variant="caption"
            className="mt-1"
          >
            Landlord: {residence.landlordName} · {residence.landlordPhone}
          </Text>
        </View>
        {!readOnly && (
          <View className="-mr-2 -mt-2 flex-row">
            <IconButton
              icon="create-outline"
              accessibilityLabel="Edit residence"
              onPress={() => onEdit(index)}
            />
            <IconButton
              icon="trash-outline"
              color={colors.danger[600]}
              accessibilityLabel="Remove residence"
              onPress={() => onRemove(index)}
            />
          </View>
        )}
      </View>
      {error ? (
        <Text
          variant="caption"
          tone="danger"
          className="mt-2"
        >
          {error}
        </Text>
      ) : null}
    </Card>
  ),
);

ResidenceRow.displayName = 'ResidenceRow';
