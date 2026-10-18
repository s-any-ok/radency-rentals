import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import {
  propertySchema,
  useCreateProperty,
  useUpdateProperty,
  type PropertyFormValues,
} from 'src/entities/property';
import { getErrorMessage, toApiError } from 'src/shared/api';
import { applyServerErrors, createId, submitChange } from 'src/shared/lib';

export type EditableProperty = {
  id: string;
  name: string;
  address: string;
  city: string;
  version: string;
};

const FIELDS = ['name', 'address', 'city'] as const;

const toValues = (property: EditableProperty | null): PropertyFormValues => ({
  name: property?.name ?? '',
  address: property?.address ?? '',
  city: property?.city ?? '',
});

export const usePropertyForm = (
  property: EditableProperty | null,
  visible: boolean,
  onClose: () => void,
) => {
  const createProperty = useCreateProperty();
  const updateProperty = useUpdateProperty();
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: toValues(property),
  });
  const { reset, setError, handleSubmit } = form;

  useEffect(() => {
    if (visible) {
      reset(toValues(property));
      setFormError(null);
    }
  }, [visible, property, reset]);

  const submit = useCallback(
    () =>
      handleSubmit(async (values) => {
        setFormError(null);
        setSaving(true);
        try {
          const input = {
            name: values.name.trim(),
            address: values.address.trim(),
            city: values.city.trim(),
          };
          if (property) {
            await submitChange(updateProperty, {
              ...input,
              id: property.id,
              version: property.version,
              idempotencyKey: createId(),
              description: `Update property "${input.name}"`,
            });
          } else {
            await submitChange(createProperty, {
              ...input,
              id: createId(),
              idempotencyKey: createId(),
              description: `Add property "${input.name}"`,
            });
          }
          onClose();
        } catch (error) {
          const unmatched = applyServerErrors(setError, toApiError(error).fieldErrors, FIELDS);
          if (unmatched.length > 0 || Object.keys(toApiError(error).fieldErrors).length === 0) {
            setFormError(getErrorMessage(error));
          }
        } finally {
          setSaving(false);
        }
      })(),
    [createProperty, handleSubmit, onClose, property, setError, updateProperty],
  );

  return { form, submit, saving, formError };
};
