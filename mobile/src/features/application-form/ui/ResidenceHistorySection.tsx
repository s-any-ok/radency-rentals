import { View } from 'react-native';

import { Button, EmptyState, FieldError } from 'src/shared/ui';

import { useResidenceHistory } from '../model/useResidenceHistory';
import { ResidenceFormModal } from './ResidenceFormModal';
import { ResidenceRow } from './ResidenceRow';

type Props = {
  /** Decided by the server (Draft/Returned + owner → editable). */
  readOnly: boolean;
};

/** "Residence History" section: residences are added, edited and removed through a modal. */
export const ResidenceHistorySection = ({ readOnly }: Props) => {
  const {
    fields,
    editorVisible,
    editingValues,
    startAdd,
    startEdit,
    closeEditor,
    save,
    removeAt,
    listError,
    rowError,
  } = useResidenceHistory();

  return (
    <View>
      {fields.length === 0 ? (
        <EmptyState
          icon="home-outline"
          title="No residences yet"
          message={readOnly ? undefined : 'Add the places you lived before your current address.'}
        />
      ) : (
        fields.map((field, index) => (
          <ResidenceRow
            key={field.id}
            residence={field}
            index={index}
            error={rowError(index)}
            readOnly={readOnly}
            onEdit={startEdit}
            onRemove={removeAt}
          />
        ))
      )}
      <FieldError message={listError} />
      {!readOnly && (
        <>
          <Button
            title="Add residence"
            variant="secondary"
            icon="add"
            onPress={startAdd}
            className="mt-2"
          />
          <ResidenceFormModal
            visible={editorVisible}
            initial={editingValues}
            onSave={save}
            onClose={closeEditor}
          />
        </>
      )}
    </View>
  );
};
