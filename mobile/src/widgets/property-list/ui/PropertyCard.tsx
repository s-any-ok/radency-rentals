import { Ionicons } from '@expo/vector-icons';
import { memo } from 'react';
import { View } from 'react-native';

import type { PropertyDto } from 'src/entities/property';
import { colors } from 'src/shared/const';
import { Badge, Card, Text } from 'src/shared/ui';

type Props = {
  property: PropertyDto;
  onPress: (id: string) => void;
};

export const PropertyCard = memo(({ property, onPress }: Props) => (
  <Card
    onPress={() => onPress(property.id)}
    className="mx-4 mb-3"
  >
    <View className="flex-row items-center">
      <View className="mr-3 h-11 w-11 items-center justify-center rounded-xl bg-primary-50">
        <Ionicons
          name="business-outline"
          size={22}
          color={colors.primary[600]}
        />
      </View>
      <View className="flex-1">
        <Text
          variant="heading"
          numberOfLines={1}
        >
          {property.name}
        </Text>
        <Text
          variant="caption"
          numberOfLines={1}
        >
          {property.address}, {property.city}
        </Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={18}
        color={colors.ink[400]}
      />
    </View>
    <View className="mt-3 flex-row gap-2">
      <Badge label={`${property.unitCount} units`} />
      <Badge
        label={`${property.availableUnitCount} available`}
        tone={property.availableUnitCount > 0 ? 'success' : 'neutral'}
      />
    </View>
  </Card>
));

PropertyCard.displayName = 'PropertyCard';
