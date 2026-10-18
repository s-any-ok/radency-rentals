import { useCallback, useState } from 'react';

import { useCreateApplication, type UnitSummary } from 'src/entities/application';
import type { AvailableUnitDto } from 'src/entities/property';
import { getErrorMessage } from 'src/shared/api';
import { createId, submitChange } from 'src/shared/lib';
import { useSessionUser } from 'src/shared/model';

const toUnitSummary = (unit: AvailableUnitDto): UnitSummary => ({
  id: unit.id,
  unitNumber: unit.unitNumber,
  bedrooms: unit.bedrooms,
  monthlyRent: unit.monthlyRent,
  unitTypeName: unit.unitTypeName,
  propertyId: unit.propertyId,
  propertyName: unit.propertyName,
  propertyAddress: `${unit.propertyAddress}, ${unit.city}`,
});

/** Creates a draft with a client-generated id (works offline) and opens it. */
export const useStartApplication = (onStarted: (applicationId: string) => void) => {
  const user = useSessionUser();
  const createApplication = useCreateApplication();
  const [startingUnitId, setStartingUnitId] = useState<string | null>(null);
  const [error, setError] = useState<{ unitId: string; message: string } | null>(null);

  const start = useCallback(
    async (unit: AvailableUnitDto) => {
      if (!user) return;
      const id = createId();
      setError(null);
      setStartingUnitId(unit.id);
      try {
        await submitChange(createApplication, {
          id,
          unit: toUnitSummary(unit),
          applicantId: user.id,
          applicantName: user.fullName,
          idempotencyKey: createId(),
          description: `Start application for ${unit.propertyName}, unit ${unit.unitNumber}`,
        });
        onStarted(id);
      } catch (e) {
        setError({ unitId: unit.id, message: getErrorMessage(e) });
      } finally {
        setStartingUnitId(null);
      }
    },
    [createApplication, onStarted, user],
  );

  return { start, startingUnitId, error };
};
