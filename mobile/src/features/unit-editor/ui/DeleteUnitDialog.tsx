import type { UnitDto } from 'src/entities/property';
import { ConfirmDialog } from 'src/shared/ui';

import { useDeleteUnitAction } from '../model/useDeleteUnitAction';

type Props = {
  unit: UnitDto | null;
  onClose: () => void;
};

export const DeleteUnitDialog = ({ unit, onClose }: Props) => {
  const { remove, deleting, error } = useDeleteUnitAction(unit, onClose);

  return (
    <ConfirmDialog
      visible={!!unit}
      title={`Remove unit ${unit?.unitNumber ?? ''}?`}
      message="Units with rental applications can't be removed."
      confirmTitle="Remove"
      destructive
      loading={deleting}
      error={error}
      onConfirm={remove}
      onCancel={onClose}
    />
  );
};
