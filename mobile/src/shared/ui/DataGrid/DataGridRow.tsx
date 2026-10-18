import { memo } from 'react';
import { Pressable } from 'react-native';

import { cn } from '../../lib/cn';
import { DATA_GRID_ROW_CLASS, DataGridCell } from './DataGridCell';
import { DataGridColumn } from './types';

type Props<T> = {
  row: T;
  columns: DataGridColumn<T>[];
  onPress?: (row: T) => void;
};

const DataGridRowComponent = <T,>({ row, columns, onPress }: Props<T>) => (
  <Pressable
    disabled={!onPress}
    accessibilityRole={onPress ? 'button' : undefined}
    onPress={() => onPress?.(row)}
    className={cn(DATA_GRID_ROW_CLASS, 'active:bg-ink-50')}
  >
    {columns.map((column) => (
      <DataGridCell
        key={column.key}
        column={column}
      >
        {column.render(row)}
      </DataGridCell>
    ))}
  </Pressable>
);

export const DataGridRow = memo(DataGridRowComponent) as typeof DataGridRowComponent;
