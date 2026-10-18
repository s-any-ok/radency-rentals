import { View } from 'react-native';

import { Skeleton, SkeletonPulse } from '../Skeleton';
import { DATA_GRID_ROW_CLASS, DataGridCell } from './DataGridCell';
import { DataGridColumn } from './types';

type Props<T> = {
  columns: DataGridColumn<T>[];
  rows: number;
};

/** Placeholder rows laid out with the real columns: two text lines in the first, a pill in the rest. */
export const DataGridSkeleton = <T,>({ columns, rows }: Props<T>) => (
  <SkeletonPulse>
    {Array.from({ length: rows }, (_, rowIndex) => (
      <View
        key={rowIndex}
        className={DATA_GRID_ROW_CLASS}
      >
        {columns.map((column, columnIndex) => (
          <DataGridCell
            key={column.key}
            column={column}
          >
            {columnIndex === 0 ? (
              <>
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="mt-1.5 h-3 w-1/2" />
              </>
            ) : (
              <Skeleton className="h-5 w-3/5 rounded-full" />
            )}
          </DataGridCell>
        ))}
      </View>
    ))}
  </SkeletonPulse>
);
