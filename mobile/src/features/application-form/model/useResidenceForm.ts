import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';

import {
  EMPTY_RESIDENCE,
  residenceSchema,
  type ResidenceFormValues,
} from 'src/entities/application';

/** Local form of the residence modal; saving puts the row into the application form (not the server). */
export const useResidenceForm = (
  initial: ResidenceFormValues | null,
  visible: boolean,
  onSave: (values: ResidenceFormValues) => void,
) => {
  const form = useForm<ResidenceFormValues>({
    resolver: zodResolver(residenceSchema),
    defaultValues: initial ?? EMPTY_RESIDENCE,
  });
  const { reset, handleSubmit } = form;

  useEffect(() => {
    if (visible) reset(initial ?? EMPTY_RESIDENCE);
  }, [visible, initial, reset]);

  const submit = useCallback(() => handleSubmit(onSave)(), [handleSubmit, onSave]);

  return { form, submit };
};
