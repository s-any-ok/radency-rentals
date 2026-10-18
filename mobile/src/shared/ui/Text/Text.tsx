import { Text as RNText, TextProps } from 'react-native';

import { cn } from '../../lib/cn';

const VARIANTS = {
  title: 'text-2xl font-bold text-ink-900',
  heading: 'text-lg font-semibold text-ink-900',
  body: 'text-base text-ink-700',
  label: 'text-sm font-medium text-ink-700',
  caption: 'text-xs text-ink-500',
} as const;

const TONES = {
  default: '',
  muted: 'text-ink-500',
  primary: 'text-primary-600',
  danger: 'text-danger-600',
  success: 'text-success-700',
} as const;

export type TextVariant = keyof typeof VARIANTS;
export type TextTone = keyof typeof TONES;

type Props = TextProps & {
  variant?: TextVariant;
  tone?: TextTone;
  className?: string;
};

export const Text = ({ variant = 'body', tone = 'default', className, ...props }: Props) => (
  <RNText
    className={cn(VARIANTS[variant], TONES[tone], className)}
    {...props}
  />
);
