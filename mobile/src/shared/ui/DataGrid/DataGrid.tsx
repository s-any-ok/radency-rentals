import { ReactElement, useCallback } from 'react';
import { FlatList, ListRenderItem, View } from 'react-native';

import { PullToRefresh } from '../PullToRefresh';
import { DataGridHeader } from './DataGridHeader';
import { DataGridPagination } from './DataGridPagination';
import { DataGridRow } from './DataGridRow';
import { DataGridSkeleton } from './DataGridSkeleton';
import { DataGridColumn, DataGridSort } from './types';

const MAX_SKELETON_ROWS = 8;
const EMPTY_ROWS: never[] = [];

type Props<T> = {
  columns: DataGridColumn<T>[];
  rows: T[];
  keyExtractor: (row: T) => string;
  onRowPress?: (row: T) => void;
  /** Paging is done by the server: the grid only renders the current page and the total. */
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  sort?: DataGridSort;
  /**
   * The rows for the current query aren't here yet (first load, or new filters/page while the
   * previous rows are kept as placeholder). Rows are replaced by skeletons; the header stays put.
   */
  loading?: boolean;
  /** Pull-to-refresh; resolves when the refetch is done. */
  onRefresh?: () => Promise<unknown>;
  ListHeaderComponent?: ReactElement;
  ListEmptyComponent?: ReactElement;
};

/**
 * Reusable grid driven by a paged JSON endpoint ({ items, total, page, pageSize }).
 * Sorting and paging are delegated to the caller, which turns them into query params.
 */
export const DataGrid = <T,>({
  columns,
  rows,
  keyExtractor,
  onRowPress,
  page,
  pageSize,
  total,
  onPageChange,
  sort,
  loading = false,
  onRefresh,
  ListHeaderComponent,
  ListEmptyComponent,
}: Props<T>) => {
  const renderItem: ListRenderItem<T> = useCallback(
    ({ item }) => (
      <DataGridRow
        row={item}
        columns={columns}
        onPress={onRowPress}
      />
    ),
    [columns, onRowPress],
  );

  return (
    <FlatList
      data={loading ? EMPTY_ROWS : rows}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      ListHeaderComponent={
        <View>
          {ListHeaderComponent}
          <DataGridHeader
            columns={columns}
            sort={sort}
          />
        </View>
      }
      ListEmptyComponent={
        loading ? (
          <DataGridSkeleton
            columns={columns}
            rows={Math.min(pageSize, MAX_SKELETON_ROWS)}
          />
        ) : (
          ListEmptyComponent
        )
      }
      ListFooterComponent={
        !loading && total > 0 ? (
          <DataGridPagination
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={onPageChange}
          />
        ) : null
      }
      refreshControl={onRefresh ? <PullToRefresh onRefresh={onRefresh} /> : undefined}
    />
  );
};
