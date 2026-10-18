import { useCallback } from 'react';
import { FlatList, ListRenderItem, View } from 'react-native';

import { DeletePropertyDialog, PropertyFormModal } from 'src/features/property-editor';
import { DeleteUnitDialog, UnitFormModal } from 'src/features/unit-editor';
import { useProperty, type UnitDto } from 'src/entities/property';
import { getErrorMessage } from 'src/shared/api';
import { Button, Card, EmptyState, ErrorState, PullToRefresh, Text } from 'src/shared/ui';

import { usePropertyUnitsEditor } from '../model/usePropertyUnitsEditor';
import { PropertyUnitsSkeleton } from './PropertyUnitsSkeleton';
import { UnitRow } from './UnitRow';

type Props = {
  propertyId: string;
  onPropertyDeleted: () => void;
};

/** A property with its units; all changes happen in modals. */
export const PropertyUnits = ({ propertyId, onPropertyDeleted }: Props) => {
  const { data: property, isLoading, error, refetch } = useProperty(propertyId);
  const editor = usePropertyUnitsEditor();
  const { editUnit, deleteUnit } = editor;
  const retry = useCallback(() => void refetch(), [refetch]);

  const renderItem: ListRenderItem<UnitDto> = useCallback(
    ({ item }) => (
      <UnitRow
        unit={item}
        onEdit={editUnit}
        onDelete={deleteUnit}
      />
    ),
    [deleteUnit, editUnit],
  );

  if (isLoading) return <PropertyUnitsSkeleton />;
  if (!property) {
    return (
      <ErrorState
        message={error ? getErrorMessage(error) : 'Property not found.'}
        onRetry={retry}
      />
    );
  }

  return (
    <>
      <FlatList
        data={property.units}
        keyExtractor={(unit) => unit.id}
        renderItem={renderItem}
        ListHeaderComponent={
          <View>
            <Card className="mx-4 mb-4">
              <Text variant="heading">{property.name}</Text>
              <Text tone="muted">
                {property.address}, {property.city}
              </Text>
              <View className="mt-3 flex-row gap-2">
                <Button
                  title="Edit"
                  size="sm"
                  variant="secondary"
                  icon="create-outline"
                  onPress={editor.editProperty}
                />
                <Button
                  title="Remove"
                  size="sm"
                  variant="secondary"
                  icon="trash-outline"
                  onPress={editor.deleteProperty}
                />
              </View>
            </Card>
            <View className="mb-3 flex-row items-center justify-between px-4">
              <Text variant="heading">Units ({property.units.length})</Text>
              <Button
                title="Add unit"
                size="sm"
                icon="add"
                onPress={editor.addUnit}
              />
            </View>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon="key-outline"
            title="No units yet"
            message="Add units so applicants can apply for them."
          />
        }
        refreshControl={<PullToRefresh onRefresh={refetch} />}
        contentContainerClassName="pb-8"
      />

      <UnitFormModal
        visible={editor.editingUnit !== null}
        propertyId={property.id}
        unit={editor.editingUnit === 'new' ? null : editor.editingUnit}
        onClose={editor.closeUnitEditor}
      />
      <DeleteUnitDialog
        unit={editor.deletingUnit}
        onClose={editor.closeUnitDelete}
      />
      <PropertyFormModal
        visible={editor.editingProperty}
        property={property}
        onClose={editor.closePropertyEditor}
      />
      <DeletePropertyDialog
        visible={editor.deletingProperty}
        property={property}
        onClose={editor.closePropertyDelete}
        onDeleted={onPropertyDeleted}
      />
    </>
  );
};
