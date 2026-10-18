import { useCallback, useState } from 'react';

import { useDeleteProperty } from 'src/entities/property';
import { getErrorMessage } from 'src/shared/api';
import { createId, submitChange } from 'src/shared/lib';

import { EditableProperty } from './usePropertyForm';

export const useDeletePropertyAction = (property: EditableProperty, onDeleted: () => void) => {
  const deleteProperty = useDeleteProperty();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remove = useCallback(async () => {
    setError(null);
    setDeleting(true);
    try {
      await submitChange(deleteProperty, {
        id: property.id,
        version: property.version,
        idempotencyKey: createId(),
        description: `Remove property "${property.name}"`,
      });
      onDeleted();
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setDeleting(false);
    }
  }, [deleteProperty, onDeleted, property]);

  const resetError = useCallback(() => setError(null), []);

  return { remove, deleting, error, resetError };
};
