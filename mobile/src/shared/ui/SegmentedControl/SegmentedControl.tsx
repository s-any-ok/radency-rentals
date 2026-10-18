import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../const';
import { cn } from '../../lib/cn';

type Option<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
};

export const SegmentedControl = <T extends string>({ options, value, onChange }: Props<T>) => (
  <View className="flex-row rounded-xl bg-ink-100 p-1">
    {options.map((option) => {
      const selected = option.value === value;
      return (
        <Pressable
          key={option.value}
          accessibilityRole="button"
          accessibilityState={{ selected }}
          onPress={() => onChange(option.value)}
          // Keep the className set stable between renders: NativeWind upgrades a component when a
          // variable-based class (shadow-*) appears later, which crashes inside modals. The shadow
          // goes through `style` instead.
          className={cn('flex-1 items-center rounded-lg py-2.5', selected && 'bg-white')}
          style={selected ? styles.selected : undefined}
        >
          <Text
            className={cn('text-sm font-semibold', selected ? 'text-primary-700' : 'text-ink-500')}
          >
            {option.label}
          </Text>
        </Pressable>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  selected: {
    shadowColor: colors.ink[900],
    shadowOpacity: 0.08,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
});
