import { useCallback, useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';

import type { ApplicationFormValues, ResidenceFormValues } from 'src/entities/application';

/** Add / edit / remove residences of the application form (saved to the server on Continue). */
export const useResidenceHistory = () => {
  const { control, getValues, clearErrors, formState } = useFormContext<ApplicationFormValues>();
  const { fields, append, update, remove } = useFieldArray({ control, name: 'residences' });
  const [editingIndex, setEditingIndex] = useState<number | 'new' | null>(null);

  const startAdd = useCallback(() => setEditingIndex('new'), []);
  const startEdit = useCallback((index: number) => setEditingIndex(index), []);
  const closeEditor = useCallback(() => setEditingIndex(null), []);

  const save = useCallback(
    (values: ResidenceFormValues) => {
      if (editingIndex === 'new') {
        append(values);
      } else if (editingIndex !== null) {
        update(editingIndex, values);
      }
      clearErrors('residences');
      setEditingIndex(null);
    },
    [append, clearErrors, editingIndex, update],
  );

  const removeAt = useCallback(
    (index: number) => {
      remove(index);
      clearErrors('residences');
    },
    [clearErrors, remove],
  );

  const editingValues =
    typeof editingIndex === 'number' ? getValues(`residences.${editingIndex}`) : null;

  const errors = formState.errors.residences;
  const listError = errors?.message ?? errors?.root?.message;
  const rowError = (index: number): string | undefined => {
    const row = errors?.[index];
    if (!row) return undefined;
    return (
      row.address?.message ??
      row.landlordName?.message ??
      row.landlordPhone?.message ??
      row.moveInDate?.message ??
      row.moveOutDate?.message
    );
  };

  return {
    fields,
    editorVisible: editingIndex !== null,
    editingValues,
    startAdd,
    startEdit,
    closeEditor,
    save,
    removeAt,
    listError,
    rowError,
  };
};
