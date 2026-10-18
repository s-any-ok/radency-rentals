import { View } from 'react-native';

import { Text } from '../Text';

type Props = { label: string; value: string | number | null | undefined };

export const KeyValueRow = ({ label, value }: Props) => (
  <View className="flex-row justify-between gap-4 border-b border-ink-100 py-2.5">
    <Text
      variant="label"
      tone="muted"
    >
      {label}
    </Text>
    <Text className="flex-1 text-right text-ink-900">
      {value === null || value === undefined || value === '' ? '—' : String(value)}
    </Text>
  </View>
);
