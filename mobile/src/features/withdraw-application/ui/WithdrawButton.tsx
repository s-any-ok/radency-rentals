import { useCallback, useState } from 'react';
import { View } from 'react-native';

import type { ApplicationDto } from 'src/entities/application';
import { Button, ConfirmDialog } from 'src/shared/ui';

import { useWithdrawAction } from '../model/useWithdrawAction';

type Props = { application: ApplicationDto };

/**
 * Shown only while the server allows withdrawing. The dialog stays mounted while it is open: the
 * optimistic update clears `canWithdraw` right away, and a rejected withdrawal must still be able
 * to show its error.
 */
export const WithdrawButton = ({ application }: Props) => {
  const [open, setOpen] = useState(false);
  const show = useCallback(() => setOpen(true), []);
  const hide = useCallback(() => setOpen(false), []);
  const { confirm, busy, error } = useWithdrawAction(application, hide);

  if (!application.canWithdraw && !open) return null;

  return (
    <>
      {application.canWithdraw ? (
        <View className="mt-2 px-4">
          <Button
            title="Withdraw application"
            variant="ghost"
            icon="close-circle-outline"
            onPress={show}
          />
        </View>
      ) : null}
      <ConfirmDialog
        visible={open}
        title="Withdraw application?"
        message="A withdrawn application can't be reopened. You can start a new one while the unit is available."
        confirmTitle="Withdraw"
        destructive
        loading={busy}
        error={error}
        onConfirm={confirm}
        onCancel={hide}
      />
    </>
  );
};
