import { useCallback } from 'react';
import { FlatList, ListRenderItem } from 'react-native';

import { useStartApplication } from 'src/features/start-application';
import { useAvailableUnits, type AvailableUnitDto } from 'src/entities/property';
import { getErrorMessage } from 'src/shared/api';
import { CardListSkeleton, EmptyState, ListPlaceholder, PullToRefresh } from 'src/shared/ui';

import { AvailableUnitCard } from './AvailableUnitCard';

type Props = {
  onApplicationStarted: (applicationId: string) => void;
};

/** Units without an active lease; an applicant starts an application from here. */
export const AvailableUnitList = ({ onApplicationStarted }: Props) => {
  const { data, isLoading, error, refetch } = useAvailableUnits();
  const { start, startingUnitId, error: startError } = useStartApplication(onApplicationStarted);
  const retry = useCallback(() => void refetch(), [refetch]);

  const renderItem: ListRenderItem<AvailableUnitDto> = useCallback(
    ({ item }) => (
      <AvailableUnitCard
        unit={item}
        starting={startingUnitId === item.id}
        error={startError?.unitId === item.id ? startError.message : undefined}
        onApply={start}
      />
    ),
    [start, startError, startingUnitId],
  );

  return (
    <FlatList
      data={data}
      keyExtractor={(unit) => unit.id}
      renderItem={renderItem}
      ListEmptyComponent={
        <ListPlaceholder
          loading={isLoading}
          skeleton={<CardListSkeleton />}
          errorMessage={error && !data ? getErrorMessage(error) : null}
          onRetry={retry}
          empty={
            <EmptyState
              icon="key-outline"
              title="No units available"
              message="Check back later — leased units become available again when their lease ends."
            />
          }
        />
      }
      refreshControl={<PullToRefresh onRefresh={refetch} />}
      contentContainerClassName="pb-8"
    />
  );
};
