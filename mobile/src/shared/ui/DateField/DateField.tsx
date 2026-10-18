import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, {
  DateTimePickerAndroid,
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useCallback, useMemo, useState } from 'react';
import { Keyboard, Platform, Pressable, Text, View } from 'react-native';

import { colors } from '../../const';
import { cn } from '../../lib/cn';
import { formatDate, parseIsoDate, toIsoDate } from '../../lib/format';
import { FieldError } from '../FieldError';

type Props = {
  label: string;
  /** "YYYY-MM-DD" or empty string. */
  value: string;
  onChange: (value: string) => void;
  error?: string;
  maximumDate?: Date;
  readOnly?: boolean;
};

export const DateField = ({ label, value, onChange, error, maximumDate, readOnly }: Props) => {
  const [iosOpen, setIosOpen] = useState(false);
  const current = useMemo(() => (value ? parseIsoDate(value) : new Date()), [value]);

  const handleIosChange = useCallback(
    (_event: DateTimePickerEvent, date?: Date) => {
      if (date) onChange(toIsoDate(date));
    },
    [onChange],
  );

  const open = useCallback(() => {
    // The picker replaces typing: an open keyboard would cover the inline calendar.
    Keyboard.dismiss();
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: current,
        mode: 'date',
        maximumDate,
        onChange: (event, date) => {
          if (event.type === 'set' && date) onChange(toIsoDate(date));
        },
      });
      return;
    }
    setIosOpen((isOpen) => !isOpen);
  }, [current, maximumDate, onChange]);

  return (
    <View className="mb-4">
      <Text className="mb-1.5 text-sm font-medium text-ink-700">{label}</Text>
      <Pressable
        accessibilityRole="button"
        disabled={readOnly}
        onPress={open}
        className={cn(
          'h-12 flex-row items-center justify-between rounded-xl border px-4',
          readOnly ? 'border-transparent bg-ink-100' : 'bg-white',
          error ? 'border-danger-500' : iosOpen ? 'border-primary-500' : 'border-ink-200',
        )}
      >
        <Text className={cn('text-base', value ? 'text-ink-900' : 'text-ink-400')}>
          {value ? formatDate(value) : 'Select a date'}
        </Text>
        {!readOnly && (
          <Ionicons
            name="calendar-outline"
            size={18}
            color={colors.ink[500]}
          />
        )}
      </Pressable>
      {Platform.OS === 'ios' && iosOpen && (
        <DateTimePicker
          value={current}
          mode="date"
          display="inline"
          maximumDate={maximumDate}
          onChange={handleIosChange}
          accentColor={colors.primary[600]}
        />
      )}
      <FieldError message={error} />
    </View>
  );
};
