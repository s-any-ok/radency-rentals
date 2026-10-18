import { PropsWithChildren } from 'react';
import { View } from 'react-native';

import { cn } from '../../lib/cn';
import { DataGridColumn } from './types';

/** Classes shared by data rows and their loading placeholders, so both have the same height. */
export const DATA_GRID_ROW_CLASS =
  'flex-row items-center border-b border-ink-100 bg-white px-4 py-3';

type Props<T> = PropsWithChildren<{ column: DataGridColumn<T> }>;

/** One cell: width and alignment come from the column definition. */
export const DataGridCell = <T,>({ column, children }: Props<T>) => (
  <View
    style={{ flex: column.flex ?? 1 }}
    className={cn(column.align === 'right' && 'items-end')}
  >
    {children}
  </View>
);
