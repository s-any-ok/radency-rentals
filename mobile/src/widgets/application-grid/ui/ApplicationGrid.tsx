import { useCallback, useMemo } from 'react';
import { View } from 'react-native';

import { ApplicationFilters } from 'src/features/application-filters';
import {
  APPLICATION_STATUS_META,
  useApplications,
  type ApplicationListItem,
} from 'src/entities/application';
import { getErrorMessage } from 'src/shared/api';
import { formatDate } from 'src/shared/lib';
import { useApplicationFiltersStore, useIsPropertyManager } from 'src/shared/model';
import {
  Badge,
  DataGrid,
  EmptyState,
  ErrorState,
  Text,
  type DataGridColumn,
  type DataGridSort,
} from 'src/shared/ui';

import { useApplicationListParams } from '../model/useApplicationListParams';

type Props = {
  onOpen: (applicationId: string) => void;
};

const keyExtractor = (row: ApplicationListItem) => row.id;

/** Application list on top of the reusable DataGrid; filtering, sorting and paging run on the server. */
export const ApplicationGrid = ({ onOpen }: Props) => {
  const isManager = useIsPropertyManager();
  const params = useApplicationListParams();
  const setPage = useApplicationFiltersStore((s) => s.setPage);
  const setSort = useApplicationFiltersStore((s) => s.setSort);
  const { data, isLoading, isPlaceholderData, error, refetch } = useApplications(params);

  const columns = useMemo<DataGridColumn<ApplicationListItem>[]>(
    () => [
      {
        key: 'unit',
        title: 'Property',
        flex: 2.2,
        sortKey: 'Property',
        render: (row) => (
          <View className="pr-2">
            <Text
              className="font-semibold text-ink-900"
              numberOfLines={1}
            >
              {row.propertyName}
            </Text>
            <Text
              variant="caption"
              numberOfLines={1}
            >
              Unit {row.unitNumber}
              {isManager ? ` · ${row.applicantName}` : ''}
            </Text>
          </View>
        ),
      },
      {
        key: 'status',
        title: 'Status',
        flex: 1.3,
        sortKey: 'Status',
        render: (row) => (
          <Badge
            label={APPLICATION_STATUS_META[row.status].label}
            tone={APPLICATION_STATUS_META[row.status].tone}
          />
        ),
      },
      {
        key: 'updated',
        title: 'Updated',
        flex: 1.2,
        align: 'right',
        sortKey: 'UpdatedAt',
        render: (row) => <Text variant="caption">{formatDate(row.updatedAt)}</Text>,
      },
    ],
    [isManager],
  );

  const sort = useMemo<DataGridSort>(
    () => ({ sortBy: params.sortBy, direction: params.sortDirection, onChange: setSort }),
    [params.sortBy, params.sortDirection, setSort],
  );

  const onRowPress = useCallback((row: ApplicationListItem) => onOpen(row.id), [onOpen]);
  const retry = useCallback(() => void refetch(), [refetch]);

  return (
    <DataGrid
      columns={columns}
      rows={data?.items ?? []}
      keyExtractor={keyExtractor}
      onRowPress={onRowPress}
      page={params.page}
      pageSize={params.pageSize}
      total={data?.total ?? 0}
      onPageChange={setPage}
      sort={sort}
      // New filters/page keep the previous rows as placeholder data: show skeletons instead.
      loading={isLoading || isPlaceholderData}
      onRefresh={refetch}
      ListHeaderComponent={<ApplicationFilters />}
      ListEmptyComponent={
        error && !data ? (
          <ErrorState
            message={getErrorMessage(error)}
            onRetry={retry}
          />
        ) : (
          <EmptyState
            title="No applications"
            message={
              isManager
                ? 'Nothing matches these filters.'
                : 'Browse available units to start an application.'
            }
          />
        )
      }
    />
  );
};
