import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

import {
  unitSchema,
  useCreateUnit,
  useUnitTypes,
  useUpdateUnit,
  type UnitDto,
  type UnitFormValues,
} from 'src/entities/property';
import { ERROR_CODES, getErrorMessage, toApiError } from 'src/shared/api';
import { applyServerErrors, createId, submitChange } from 'src/shared/lib';
import type { SelectOption } from 'src/shared/ui';

const FIELDS = ['unitNumber', 'bedrooms', 'monthlyRent', 'unitTypeId'] as const;

const toValues = (unit: UnitDto | null): Partial<UnitFormValues> => ({
  unitNumber: unit?.unitNumber ?? '',
  bedrooms: unit ? String(unit.bedrooms) : '',
  monthlyRent: unit ? String(unit.monthlyRent) : '',
  unitTypeId: unit?.unitTypeId,
});

export const useUnitForm = (
  propertyId: string,
  unit: UnitDto | null,
  visible: boolean,
  onClose: () => void,
) => {
  const createUnit = useCreateUnit();
  const updateUnit = useUpdateUnit();
  const { data: unitTypes = [] } = useUnitTypes();
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<UnitFormValues>({
    resolver: zodResolver(unitSchema),
    defaultValues: toValues(unit),
  });
  const { reset, setError, handleSubmit } = form;

  useEffect(() => {
    if (visible) {
      reset(toValues(unit));
      setFormError(null);
    }
  }, [visible, unit, reset]);

  // Inactive types stay visible on the unit that already uses them but can't be picked for others.
  const unitTypeOptions = useMemo<SelectOption<number>[]>(
    () =>
      unitTypes.map((type) => ({
        value: type.id,
        label: type.name,
        hint: type.isActive ? undefined : 'inactive',
        disabled: !type.isActive && type.id !== unit?.unitTypeId,
      })),
    [unit?.unitTypeId, unitTypes],
  );

  const submit = useCallback(
    () =>
      handleSubmit(async (values) => {
        setFormError(null);
        setSaving(true);
        const unitTypeName = unitTypes.find((t) => t.id === values.unitTypeId)?.name ?? '';
        const input = {
          unitNumber: values.unitNumber.trim(),
          bedrooms: Number(values.bedrooms),
          monthlyRent: Number(values.monthlyRent),
          unitTypeId: values.unitTypeId,
          unitTypeName,
          propertyId,
        };

        try {
          if (unit) {
            await submitChange(updateUnit, {
              ...input,
              id: unit.id,
              version: unit.version,
              idempotencyKey: createId(),
              description: `Update unit ${input.unitNumber}`,
            });
          } else {
            await submitChange(createUnit, {
              ...input,
              id: createId(),
              idempotencyKey: createId(),
              description: `Add unit ${input.unitNumber}`,
            });
          }
          onClose();
        } catch (error) {
          const apiError = toApiError(error);
          if (apiError.code === ERROR_CODES.unitTypeInactive) {
            setError('unitTypeId', { message: apiError.message });
            return;
          }
          const unmatched = applyServerErrors(setError, apiError.fieldErrors, FIELDS);
          if (unmatched.length > 0 || Object.keys(apiError.fieldErrors).length === 0) {
            setFormError(getErrorMessage(error));
          }
        } finally {
          setSaving(false);
        }
      })(),
    [createUnit, handleSubmit, onClose, propertyId, setError, unit, unitTypes, updateUnit],
  );

  return { form, submit, saving, formError, unitTypeOptions };
};
