import { memo } from 'react';
import { Pressable, Text } from 'react-native';

import { cn } from '../../lib/cn';

type Props = {
  label: string;
  selected?: boolean;
  onPress: () => void;
};

export const Chip = memo(({ label, selected, onPress }: Props) => (
  <Pressable
    accessibilityRole="button"
    accessibilityState={{ selected: !!selected }}
    onPress={onPress}
    className={cn(
      'rounded-full border px-3.5 py-1.5',
      // Both branches carry an active: class so NativeWind never has to upgrade the component on toggle.
      selected
        ? 'border-primary-600 bg-primary-600 active:bg-primary-700'
        : 'border-ink-200 bg-white active:bg-ink-100',
    )}
  >
    <Text className={cn('text-sm font-medium', selected ? 'text-white' : 'text-ink-700')}>
      {label}
    </Text>
  </Pressable>
));

Chip.displayName = 'Chip';
