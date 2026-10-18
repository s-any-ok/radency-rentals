import { Ionicons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { colors } from '../../const';
import { cn } from '../../lib/cn';
import { FieldError } from '../FieldError';

export type SelectOption<T extends string | number> = {
  value: T;
  label: string;
  /** Disabled options are shown but can't be picked (e.g. inactive lookup values). */
  disabled?: boolean;
  hint?: string;
};

type Props<T extends string | number> = {
  label: string;
  value: T | null | undefined;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  placeholder?: string;
  error?: string;
  readOnly?: boolean;
};

/** Inline dropdown (expands in place, so it also works inside modal sheets). */
export const SelectField = <T extends string | number>({
  label,
  value,
  options,
  onChange,
  placeholder = 'Select…',
  error,
  readOnly,
}: Props<T>) => {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  const toggle = useCallback(() => setOpen((current) => !current), []);

  return (
    <View className="mb-4">
      <Text className="mb-1.5 text-sm font-medium text-ink-700">{label}</Text>
      <Pressable
        accessibilityRole="button"
        disabled={readOnly}
        onPress={toggle}
        className={cn(
          'h-12 flex-row items-center justify-between rounded-xl border px-4',
          readOnly ? 'border-transparent bg-ink-100' : 'bg-white',
          error ? 'border-danger-500' : open ? 'border-primary-500' : 'border-ink-200',
        )}
      >
        <Text className={cn('text-base', selected ? 'text-ink-900' : 'text-ink-400')}>
          {selected ? selected.label : placeholder}
          {selected?.hint ? ` · ${selected.hint}` : ''}
        </Text>
        {!readOnly && (
          <Ionicons
            name={open ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={colors.ink[500]}
          />
        )}
      </Pressable>
      {open && (
        <View className="mt-1 overflow-hidden rounded-xl border border-ink-200 bg-white">
          {options.map((option) => (
            <Pressable
              key={String(option.value)}
              accessibilityRole="button"
              accessibilityState={{ disabled: !!option.disabled, selected: option.value === value }}
              disabled={option.disabled}
              onPress={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={cn(
                'flex-row items-center justify-between border-b border-ink-100 px-4 py-3',
                option.disabled ? 'opacity-40' : 'active:bg-ink-50',
              )}
            >
              <Text className="text-base text-ink-900">
                {option.label}
                {option.hint ? (
                  <Text className="text-sm text-ink-500"> · {option.hint}</Text>
                ) : null}
              </Text>
              {option.value === value && (
                <Ionicons
                  name="checkmark"
                  size={18}
                  color={colors.primary[600]}
                />
              )}
            </Pressable>
          ))}
        </View>
      )}
      <FieldError message={error} />
    </View>
  );
};
