import { Controller } from 'react-hook-form';
import { View } from 'react-native';

import type { UnitDto } from 'src/entities/property';
import { Banner, Button, ModalSheet, SelectField, TextField } from 'src/shared/ui';

import { useUnitForm } from '../model/useUnitForm';

type Props = {
  visible: boolean;
  propertyId: string;
  /** null → add a new unit. */
  unit: UnitDto | null;
  onClose: () => void;
};

export const UnitFormModal = ({ visible, propertyId, unit, onClose }: Props) => {
  const { form, submit, saving, formError, unitTypeOptions } = useUnitForm(
    propertyId,
    unit,
    visible,
    onClose,
  );

  return (
    <ModalSheet
      visible={visible}
      title={unit ? `Edit unit ${unit.unitNumber}` : 'New unit'}
      onClose={onClose}
      footer={
        <Button
          title={unit ? 'Save changes' : 'Add unit'}
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
        name="unitNumber"
        render={({ field, fieldState }) => (
          <TextField
            label="Unit number"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            placeholder="101"
            autoCapitalize="characters"
          />
        )}
      />
      <View className="flex-row gap-3">
        <Controller
          control={form.control}
          name="bedrooms"
          render={({ field, fieldState }) => (
            <TextField
              label="Bedrooms"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={fieldState.error?.message}
              keyboardType="number-pad"
              placeholder="2"
              className="flex-1"
            />
          )}
        />
        <Controller
          control={form.control}
          name="monthlyRent"
          render={({ field, fieldState }) => (
            <TextField
              label="Monthly rent ($)"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={fieldState.error?.message}
              keyboardType="decimal-pad"
              placeholder="1450"
              className="flex-1"
            />
          )}
        />
      </View>
      <Controller
        control={form.control}
        name="unitTypeId"
        render={({ field, fieldState }) => (
          <SelectField
            label="Unit type"
            value={field.value}
            options={unitTypeOptions}
            onChange={field.onChange}
            error={fieldState.error?.message}
            placeholder="Select a unit type"
          />
        )}
      />
    </ModalSheet>
  );
};
