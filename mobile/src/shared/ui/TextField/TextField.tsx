import { Ionicons } from '@expo/vector-icons';
import { Ref, useState } from 'react';
import { Pressable, Text, TextInput, TextInputProps, View } from 'react-native';

import { colors } from '../../const';
import { cn } from '../../lib/cn';
import { FieldError } from '../FieldError';

type Props = TextInputProps & {
  label: string;
  error?: string;
  /** Read-only fields render as plain text, as decided by the server. */
  readOnly?: boolean;
  ref?: Ref<TextInput>;
  className?: string;
};

export const TextField = ({
  label,
  error,
  readOnly,
  ref,
  className,
  onFocus,
  onBlur,
  secureTextEntry,
  ...props
}: Props) => {
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const hidden = !!secureTextEntry && !revealed;

  return (
    <View className={cn('mb-4', className)}>
      <Text className="mb-1.5 text-sm font-medium text-ink-700">{label}</Text>
      {readOnly ? (
        <Text className="min-h-12 rounded-xl bg-ink-100 px-4 py-3 text-base text-ink-900">
          {props.value || '—'}
        </Text>
      ) : (
        <View className="justify-center">
          <TextInput
            ref={ref}
            placeholderTextColor={colors.ink[400]}
            className={cn(
              'rounded-xl border bg-white px-4 text-base text-ink-900',
              props.multiline ? 'min-h-28 py-3' : 'h-12',
              secureTextEntry && 'pr-12',
              error ? 'border-danger-500' : focused ? 'border-primary-500' : 'border-ink-200',
            )}
            onFocus={(event) => {
              setFocused(true);
              onFocus?.(event);
            }}
            onBlur={(event) => {
              setFocused(false);
              onBlur?.(event);
            }}
            {...(secureTextEntry ? { autoCapitalize: 'none', autoCorrect: false } : null)}
            {...props}
            secureTextEntry={hidden}
          />
          {secureTextEntry ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={revealed ? 'Hide password' : 'Show password'}
              hitSlop={8}
              onPress={() => setRevealed((value) => !value)}
              className="absolute right-3 h-8 w-8 items-center justify-center"
            >
              <Ionicons
                name={revealed ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={colors.ink[400]}
              />
            </Pressable>
          ) : null}
        </View>
      )}
      <FieldError message={error} />
    </View>
  );
};
