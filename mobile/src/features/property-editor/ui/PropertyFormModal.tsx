import { Controller } from 'react-hook-form';

import { Banner, Button, ModalSheet, TextField } from 'src/shared/ui';

import { EditableProperty, usePropertyForm } from '../model/usePropertyForm';

type Props = {
  visible: boolean;
  /** null → create a new property. */
  property: EditableProperty | null;
  onClose: () => void;
};

export const PropertyFormModal = ({ visible, property, onClose }: Props) => {
  const { form, submit, saving, formError } = usePropertyForm(property, visible, onClose);

  return (
    <ModalSheet
      visible={visible}
      title={property ? 'Edit property' : 'New property'}
      onClose={onClose}
      footer={
        <Button
          title={property ? 'Save changes' : 'Add property'}
          onPress={submit}
          loading={saving}
        />
      }
    >
      {formError ? (
        <Banner
          tone="danger"
          icon="alert-circle"
          message={formError}
          className="mb-4"
        />
      ) : null}
      <Controller
        control={form.control}
        name="name"
        render={({ field, fieldState }) => (
          <TextField
            label="Name"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            placeholder="Maple Residences"
          />
        )}
      />
      <Controller
        control={form.control}
        name="address"
        render={({ field, fieldState }) => (
          <TextField
            label="Street address"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            placeholder="123 Maple Ave"
          />
        )}
      />
      <Controller
        control={form.control}
        name="city"
        render={({ field, fieldState }) => (
          <TextField
            label="City"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            placeholder="Springfield"
          />
        )}
      />
    </ModalSheet>
  );
};
