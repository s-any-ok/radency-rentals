import { useCallback, useState } from 'react';
import { FlatList, ListRenderItem, View } from 'react-native';

import { PropertyFormModal } from 'src/features/property-editor';
import { useProperties, type PropertyDto } from 'src/entities/property';
import { getErrorMessage } from 'src/shared/api';
import {
  Button,
  CardListSkeleton,
  EmptyState,
  ListPlaceholder,
  PullToRefresh,
} from 'src/shared/ui';

import { PropertyCard } from './PropertyCard';

type Props = {
  onOpenProperty: (id: string) => void;
};

export const PropertyList = ({ onOpenProperty }: Props) => {
  const { data, isLoading, error, refetch } = useProperties();
  const [creating, setCreating] = useState(false);

  const openCreate = useCallback(() => setCreating(true), []);
  const closeCreate = useCallback(() => setCreating(false), []);
  const retry = useCallback(() => void refetch(), [refetch]);

  const renderItem: ListRenderItem<PropertyDto> = useCallback(
    ({ item }) => (
      <PropertyCard
        property={item}
        onPress={onOpenProperty}
      />
    ),
    [onOpenProperty],
  );

  return (
    <>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={
          <View className="px-4 pb-3">
            <Button
              title="Add property"
              icon="add"
              onPress={openCreate}
            />
          </View>
        }
        ListEmptyComponent={
          <ListPlaceholder
            loading={isLoading}
            skeleton={<CardListSkeleton />}
            errorMessage={error && !data ? getErrorMessage(error) : null}
            onRetry={retry}
            empty={
              <EmptyState
                icon="business-outline"
                title="No properties yet"
                message="Add your first property to start listing units."
              />
            }
          />
        }
        refreshControl={<PullToRefresh onRefresh={refetch} />}
        contentContainerClassName="pb-8"
      />
      <PropertyFormModal
        visible={creating}
        property={null}
        onClose={closeCreate}
      />
    </>
  );
};
