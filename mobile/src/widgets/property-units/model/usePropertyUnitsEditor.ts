import { useCallback, useState } from 'react';

import type { UnitDto } from 'src/entities/property';

/** Which modal of the property screen is open. */
export const usePropertyUnitsEditor = () => {
  const [editingUnit, setEditingUnit] = useState<UnitDto | 'new' | null>(null);
  const [deletingUnit, setDeletingUnit] = useState<UnitDto | null>(null);
  const [editingProperty, setEditingProperty] = useState(false);
  const [deletingProperty, setDeletingProperty] = useState(false);

  return {
    editingUnit,
    deletingUnit,
    editingProperty,
    deletingProperty,
    addUnit: useCallback(() => setEditingUnit('new'), []),
    editUnit: useCallback((unit: UnitDto) => setEditingUnit(unit), []),
    closeUnitEditor: useCallback(() => setEditingUnit(null), []),
    deleteUnit: useCallback((unit: UnitDto) => setDeletingUnit(unit), []),
    closeUnitDelete: useCallback(() => setDeletingUnit(null), []),
    editProperty: useCallback(() => setEditingProperty(true), []),
    closePropertyEditor: useCallback(() => setEditingProperty(false), []),
    deleteProperty: useCallback(() => setDeletingProperty(true), []),
    closePropertyDelete: useCallback(() => setDeletingProperty(false), []),
  };
};
