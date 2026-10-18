import { Ionicons } from '@expo/vector-icons';
import { ComponentProps, ReactNode } from 'react';
import { View } from 'react-native';

import { colors } from '../../const';
import { cn } from '../../lib/cn';
import { Text } from '../Text';

const TONES = {
  info: {
    container: 'bg-info-50 border-info-600/20',
    icon: colors.info[600],
    text: 'text-info-700',
  },
  warning: {
    container: 'bg-warning-50 border-warning-500/30',
    icon: colors.warning[700],
    text: 'text-warning-700',
  },
  danger: {
    container: 'bg-danger-50 border-danger-500/30',
    icon: colors.danger[600],
    text: 'text-danger-700',
  },
  neutral: { container: 'bg-ink-100 border-ink-200', icon: colors.ink[700], text: 'text-ink-700' },
} as const;

type Props = {
  tone?: keyof typeof TONES;
  icon?: ComponentProps<typeof Ionicons>['name'];
  title?: string;
  message: string;
  action?: ReactNode;
  className?: string;
};

export const Banner = ({
  tone = 'info',
  icon = 'information-circle',
  title,
  message,
  action,
  className,
}: Props) => {
  const style = TONES[tone];

  return (
    <View
      className={cn(
        'flex-row items-start gap-3 rounded-xl border px-3.5 py-3',
        style.container,
        className,
      )}
    >
      <Ionicons
        name={icon}
        size={20}
        color={style.icon}
      />
      <View className="flex-1">
        {title ? <Text className={cn('text-sm font-semibold', style.text)}>{title}</Text> : null}
        <Text className={cn('text-sm', style.text)}>{message}</Text>
      </View>
      {action}
    </View>
  );
};
