import { Ionicons } from '@expo/vector-icons';
import { ComponentProps, memo } from 'react';
import { Pressable, PressableProps } from 'react-native';

import { colors } from '../../const';
import { cn } from '../../lib/cn';

type Props = Omit<PressableProps, 'children'> & {
  icon: ComponentProps<typeof Ionicons>['name'];
  color?: string;
  size?: number;
  accessibilityLabel: string;
  className?: string;
};

export const IconButton = memo(
  ({ icon, color = colors.ink[700], size = 22, className, ...props }: Props) => (
    <Pressable
      accessibilityRole="button"
      hitSlop={8}
      className={cn(
        'h-10 w-10 items-center justify-center rounded-full active:bg-ink-100',
        className,
      )}
      {...props}
    >
      <Ionicons
        name={icon}
        size={size}
        color={color}
      />
    </Pressable>
  ),
);

IconButton.displayName = 'IconButton';
