import { ConfirmDialog } from 'src/shared/ui';

import { useDeletePropertyAction } from '../model/useDeletePropertyAction';
import { EditableProperty } from '../model/usePropertyForm';

type Props = {
  visible: boolean;
  property: EditableProperty;
  onClose: () => void;
  onDeleted: () => void;
};

export const DeletePropertyDialog = ({ visible, property, onClose, onDeleted }: Props) => {
  const { remove, deleting, error } = useDeletePropertyAction(property, onDeleted);

  return (
    <ConfirmDialog
      visible={visible}
      title="Remove property?"
      message={`"${property.name}" and all of its units will be removed. Properties with applications can't be removed.`}
      confirmTitle="Remove"
      destructive
      loading={deleting}
      error={error}
      onConfirm={remove}
      onCancel={onClose}
    />
  );
};
