import { Controller, useFormContext } from 'react-hook-form';
import { View } from 'react-native';

import type { ApplicationFormValues } from 'src/entities/application';
import { TextField } from 'src/shared/ui';

type Props = {
  /** Decided by the server (Draft/Returned + owner → editable). */
  readOnly: boolean;
};

/** "Applicant Information" section; renders editable or read-only from the same markup. */
export const ApplicantInfoSection = ({ readOnly }: Props) => {
  const { control, setFocus } = useFormContext<ApplicationFormValues>();

  return (
    <View>
      <Controller
        control={control}
        name="applicantInfo.fullName"
        render={({ field, fieldState }) => (
          <TextField
            label="Full name"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            readOnly={readOnly}
            autoComplete="name"
            ref={field.ref}
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => setFocus('applicantInfo.phone')}
          />
        )}
      />
      <Controller
        control={control}
        name="applicantInfo.phone"
        render={({ field, fieldState }) => (
          <TextField
            label="Phone"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            readOnly={readOnly}
            keyboardType="phone-pad"
            autoComplete="tel"
            placeholder="+1 555 123 4567"
            ref={field.ref}
          />
        )}
      />
      <Controller
        control={control}
        name="applicantInfo.email"
        render={({ field, fieldState }) => (
          <TextField
            label="Email"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            readOnly={readOnly}
            autoCorrect={false}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            ref={field.ref}
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => setFocus('applicantInfo.currentAddress')}
          />
        )}
      />
      <Controller
        control={control}
        name="applicantInfo.currentAddress"
        render={({ field, fieldState }) => (
          <TextField
            label="Current address"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            readOnly={readOnly}
            autoComplete="street-address"
            placeholder="Street, city, ZIP"
            ref={field.ref}
          />
        )}
      />
    </View>
  );
};
