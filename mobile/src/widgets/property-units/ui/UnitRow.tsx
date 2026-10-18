import { memo } from 'react';
import { View } from 'react-native';

import type { UnitDto } from 'src/entities/property';
import { colors } from 'src/shared/const';
import { formatCurrency, formatDate } from 'src/shared/lib';
import { Badge, Card, IconButton, Text } from 'src/shared/ui';

type Props = {
  unit: UnitDto;
  onEdit: (unit: UnitDto) => void;
  onDelete: (unit: UnitDto) => void;
};

export const UnitRow = memo(({ unit, onEdit, onDelete }: Props) => (
  <Card className="mx-4 mb-3">
    <View className="flex-row items-start">
      <View className="flex-1">
        <Text variant="heading">Unit {unit.unitNumber}</Text>
        <Text variant="caption">
          {unit.bedrooms === 0
            ? 'Studio'
            : `${unit.bedrooms} bedroom${unit.bedrooms > 1 ? 's' : ''}`}{' '}
          · {formatCurrency(unit.monthlyRent)}/mo
        </Text>
      </View>
      <View className="-mr-2 -mt-2 flex-row">
        <IconButton
          icon="create-outline"
          accessibilityLabel={`Edit unit ${unit.unitNumber}`}
          onPress={() => onEdit(unit)}
        />
        <IconButton
          icon="trash-outline"
          color={colors.danger[600]}
          accessibilityLabel={`Remove unit ${unit.unitNumber}`}
          onPress={() => onDelete(unit)}
        />
      </View>
    </View>
    <View className="mt-3 flex-row flex-wrap gap-2">
      <Badge
        label={unit.unitTypeIsActive ? unit.unitTypeName : `${unit.unitTypeName} (inactive)`}
        tone={unit.unitTypeIsActive ? 'primary' : 'neutral'}
      />
      {unit.isAvailable ? (
        <Badge
          label="Available"
          tone="success"
        />
      ) : (
        <Badge
          label={`Leased until ${formatDate(unit.leasedUntil)}`}
          tone="warning"
        />
      )}
    </View>
  </Card>
));

UnitRow.displayName = 'UnitRow';
