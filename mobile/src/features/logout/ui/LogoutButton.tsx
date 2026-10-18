import { useCallback, useState } from 'react';

import { usePendingCount } from 'src/shared/model';
import { Button, ConfirmDialog } from 'src/shared/ui';

import { useLogout } from '../model/useLogout';

export const LogoutButton = () => {
  const { logout, isPending } = useLogout();
  const pendingCount = usePendingCount();
  const [confirming, setConfirming] = useState(false);

  const open = useCallback(() => setConfirming(true), []);
  const close = useCallback(() => setConfirming(false), []);

  return (
    <>
      <Button
        title="Sign out"
        variant="secondary"
        icon="log-out-outline"
        onPress={open}
      />
      <ConfirmDialog
        visible={confirming}
        title="Sign out?"
        message={
          pendingCount > 0
            ? `You have ${pendingCount} change(s) that haven't synced yet. Signing out will discard them.`
            : 'You will need to sign in again to use the app.'
        }
        confirmTitle="Sign out"
        destructive
        loading={isPending}
        onConfirm={logout}
        onCancel={close}
      />
    </>
  );
};
