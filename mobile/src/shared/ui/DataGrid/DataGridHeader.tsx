import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { colors } from '../../const';
import { cn } from '../../lib/cn';
import { DataGridColumn, DataGridSort } from './types';

type Props<T> = {
  columns: DataGridColumn<T>[];
  sort?: DataGridSort;
};

export const DataGridHeader = <T,>({ columns, sort }: Props<T>) => (
  <View className="flex-row border-b border-ink-200 bg-ink-100 px-4 py-2">
    {columns.map((column) => {
      const active = !!sort && !!column.sortKey && sort.sortBy === column.sortKey;
      const sortable = !!sort && !!column.sortKey;

      return (
        <Pressable
          key={column.key}
          disabled={!sortable}
          accessibilityRole={sortable ? 'button' : undefined}
          onPress={() => {
            if (!sort || !column.sortKey) return;
            const direction = active && sort.direction === 'Desc' ? 'Asc' : 'Desc';
            sort.onChange(column.sortKey, direction);
          }}
          style={{ flex: column.flex ?? 1 }}
          className={cn('flex-row items-center gap-1', column.align === 'right' && 'justify-end')}
        >
          <Text
            className={cn(
              'text-xs font-semibold uppercase',
              active ? 'text-primary-700' : 'text-ink-500',
            )}
          >
            {column.title}
          </Text>
          {active && (
            <Ionicons
              name={sort.direction === 'Asc' ? 'arrow-up' : 'arrow-down'}
              size={12}
              color={colors.primary[700]}
            />
          )}
        </Pressable>
      );
    })}
  </View>
);
