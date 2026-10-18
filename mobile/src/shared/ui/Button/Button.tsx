import { Ionicons } from '@expo/vector-icons';
import { ComponentProps, memo } from 'react';
import { ActivityIndicator, Pressable, PressableProps, Text, View } from 'react-native';

import { colors } from '../../const';
import { cn } from '../../lib/cn';

const VARIANTS = {
  primary: {
    container: 'bg-primary-600 active:bg-primary-700',
    text: 'text-white',
    icon: colors.white,
  },
  secondary: {
    container: 'bg-white border border-ink-200 active:bg-ink-100',
    text: 'text-ink-900',
    icon: colors.ink[700],
  },
  ghost: {
    container: 'bg-transparent active:bg-ink-100',
    text: 'text-primary-600',
    icon: colors.primary[600],
  },
  danger: {
    container: 'bg-danger-600 active:bg-danger-700',
    text: 'text-white',
    icon: colors.white,
  },
} as const;

const SIZES = {
  md: { container: 'h-12 px-5 rounded-xl', text: 'text-base' },
  sm: { container: 'h-9 px-3 rounded-lg', text: 'text-sm' },
} as const;

type Props = Omit<PressableProps, 'children'> & {
  title: string;
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof SIZES;
  icon?: ComponentProps<typeof Ionicons>['name'];
  loading?: boolean;
  className?: string;
};

export const Button = memo(
  ({
    title,
    variant = 'primary',
    size = 'md',
    icon,
    loading,
    disabled,
    className,
    ...props
  }: Props) => {
    const style = VARIANTS[variant];
    const isDisabled = disabled || loading;

    return (
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: !!isDisabled, busy: !!loading }}
        disabled={isDisabled}
        className={cn(
          'flex-row items-center justify-center',
          SIZES[size].container,
          style.container,
          isDisabled && 'opacity-50',
          className,
        )}
        {...props}
      >
        {loading ? (
          <ActivityIndicator color={style.icon} />
        ) : (
          <View className="flex-row items-center gap-2">
            {icon && (
              <Ionicons
                name={icon}
                size={size === 'sm' ? 16 : 18}
                color={style.icon}
              />
            )}
            <Text className={cn('font-semibold', SIZES[size].text, style.text)}>{title}</Text>
          </View>
        )}
      </Pressable>
    );
  },
);

Button.displayName = 'Button';
