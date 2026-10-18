import { useCallback, useState } from 'react';

import { useDeleteUnit, type UnitDto } from 'src/entities/property';
import { getErrorMessage } from 'src/shared/api';
import { createId, submitChange } from 'src/shared/lib';

export const useDeleteUnitAction = (unit: UnitDto | null, onDeleted: () => void) => {
  const deleteUnit = useDeleteUnit();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remove = useCallback(async () => {
    if (!unit) return;
    setError(null);
    setDeleting(true);
    try {
      await submitChange(deleteUnit, {
        id: unit.id,
        propertyId: unit.propertyId,
        version: unit.version,
        idempotencyKey: createId(),
        description: `Remove unit ${unit.unitNumber}`,
      });
      onDeleted();
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setDeleting(false);
    }
  }, [deleteUnit, onDeleted, unit]);

  return { remove, deleting, error };
};
