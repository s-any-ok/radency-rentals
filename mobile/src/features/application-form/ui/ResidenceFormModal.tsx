import { Controller } from 'react-hook-form';

import type { ResidenceFormValues } from 'src/entities/application';
import { Button, DateField, ModalSheet, TextField } from 'src/shared/ui';

import { useResidenceForm } from '../model/useResidenceForm';

type Props = {
  visible: boolean;
  /** null → add a new residence. */
  initial: ResidenceFormValues | null;
  onSave: (values: ResidenceFormValues) => void;
  onClose: () => void;
};

const TODAY = new Date();

export const ResidenceFormModal = ({ visible, initial, onSave, onClose }: Props) => {
  const { form, submit } = useResidenceForm(initial, visible, onSave);

  return (
    <ModalSheet
      visible={visible}
      title={initial ? 'Edit residence' : 'Add residence'}
      onClose={onClose}
      footer={
        <Button
          title={initial ? 'Update residence' : 'Add residence'}
          onPress={submit}
        />
      }
    >
      <Controller
        control={form.control}
        name="address"
        render={({ field, fieldState }) => (
          <TextField
            label="Address"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            placeholder="Street, city, ZIP"
          />
        )}
      />
      <Controller
        control={form.control}
        name="landlordName"
        render={({ field, fieldState }) => (
          <TextField
            label="Landlord name"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
          />
        )}
      />
      <Controller
        control={form.control}
        name="landlordPhone"
        render={({ field, fieldState }) => (
          <TextField
            label="Landlord phone"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            keyboardType="phone-pad"
          />
        )}
      />
      <Controller
        control={form.control}
        name="moveInDate"
        render={({ field, fieldState }) => (
          <DateField
            label="Move-in date"
            value={field.value}
            onChange={field.onChange}
            error={fieldState.error?.message}
            maximumDate={TODAY}
          />
        )}
      />
      <Controller
        control={form.control}
        name="moveOutDate"
        render={({ field, fieldState }) => (
          <DateField
            label="Move-out date"
            value={field.value}
            onChange={field.onChange}
            error={fieldState.error?.message}
            maximumDate={TODAY}
          />
        )}
      />
    </ModalSheet>
  );
};
