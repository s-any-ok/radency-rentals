import { Text, View } from 'react-native';

import { cn } from '../../lib/cn';

const TONES = {
  neutral: { container: 'bg-ink-100', text: 'text-ink-700' },
  primary: { container: 'bg-primary-50', text: 'text-primary-700' },
  info: { container: 'bg-info-50', text: 'text-info-700' },
  success: { container: 'bg-success-50', text: 'text-success-700' },
  warning: { container: 'bg-warning-50', text: 'text-warning-700' },
  danger: { container: 'bg-danger-50', text: 'text-danger-700' },
} as const;

export type BadgeTone = keyof typeof TONES;

type Props = {
  label: string;
  tone?: BadgeTone;
  className?: string;
};

export const Badge = ({ label, tone = 'neutral', className }: Props) => (
  <View className={cn('self-start rounded-full px-2.5 py-1', TONES[tone].container, className)}>
    <Text className={cn('text-xs font-semibold', TONES[tone].text)}>{label}</Text>
  </View>
);
