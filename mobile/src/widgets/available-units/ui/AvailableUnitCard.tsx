import { memo } from 'react';
import { View } from 'react-native';

import type { AvailableUnitDto } from 'src/entities/property';
import { formatCurrency } from 'src/shared/lib';
import { Badge, Button, Card, Text } from 'src/shared/ui';

type Props = {
  unit: AvailableUnitDto;
  starting: boolean;
  error?: string;
  onApply: (unit: AvailableUnitDto) => void;
};

export const AvailableUnitCard = memo(({ unit, starting, error, onApply }: Props) => (
  <Card className="mx-4 mb-3">
    <View className="flex-row items-start justify-between">
      <View className="flex-1 pr-3">
        <Text variant="heading">
          {unit.propertyName} · {unit.unitNumber}
        </Text>
        <Text
          variant="caption"
          numberOfLines={1}
        >
          {unit.propertyAddress}, {unit.city}
        </Text>
      </View>
      <Text className="text-lg font-bold text-ink-900">{formatCurrency(unit.monthlyRent)}</Text>
    </View>
    <View className="mt-3 flex-row items-center justify-between">
      <View className="flex-row gap-2">
        <Badge
          label={unit.unitTypeName}
          tone="primary"
        />
        <Badge label={unit.bedrooms === 0 ? 'Studio' : `${unit.bedrooms} bd`} />
      </View>
      <Button
        title="Apply"
        size="sm"
        icon="document-text-outline"
        loading={starting}
        onPress={() => onApply(unit)}
      />
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
));

AvailableUnitCard.displayName = 'AvailableUnitCard';
