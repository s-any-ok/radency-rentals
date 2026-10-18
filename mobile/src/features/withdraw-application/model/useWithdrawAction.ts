import { useCallback, useState } from 'react';

import { useWithdrawApplication, type ApplicationDto } from 'src/entities/application';
import { getErrorMessage } from 'src/shared/api';
import { createId, submitChange } from 'src/shared/lib';

export const useWithdrawAction = (application: ApplicationDto, onDone: () => void) => {
  const withdraw = useWithdrawApplication();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirm = useCallback(async () => {
    setError(null);
    setBusy(true);
    try {
      await submitChange(withdraw, {
        id: application.id,
        version: application.version,
        idempotencyKey: createId(),
        description: `Withdraw application for unit ${application.unit.unitNumber}`,
      });
      onDone();
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }, [application, onDone, withdraw]);

  return { confirm, busy, error };
};
