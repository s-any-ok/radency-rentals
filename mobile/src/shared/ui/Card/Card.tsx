import { PropsWithChildren } from 'react';
import { Pressable, View } from 'react-native';

import { cn } from '../../lib/cn';

type Props = PropsWithChildren<{
  onPress?: () => void;
  className?: string;
}>;

const BASE = 'rounded-2xl border border-ink-200 bg-white p-4';

export const Card = ({ children, onPress, className }: Props) =>
  onPress ? (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className={cn(BASE, 'active:bg-ink-50', className)}
    >
      {children}
    </Pressable>
  ) : (
    <View className={cn(BASE, className)}>{children}</View>
  );
