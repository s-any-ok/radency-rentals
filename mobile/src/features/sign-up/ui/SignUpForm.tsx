import { Controller } from 'react-hook-form';
import { View } from 'react-native';

import { Banner, Button, SegmentedControl, Text, TextField } from 'src/shared/ui';

import { useSignUpForm } from '../model/useSignUpForm';

const ROLE_OPTIONS = [
  { value: 'Applicant' as const, label: 'Applicant' },
  { value: 'PropertyManager' as const, label: 'Property manager' },
];

export const SignUpForm = () => {
  const { form, submit, isPending, formError } = useSignUpForm();

  return (
    <View>
      {formError ? (
        <Banner
          tone="danger"
          icon="alert-circle"
          message={formError}
          className="mb-4"
        />
      ) : null}
      <Text
        variant="label"
        className="mb-1.5"
      >
        I am a…
      </Text>
      <Controller
        control={form.control}
        name="role"
        render={({ field }) => (
          <SegmentedControl
            options={ROLE_OPTIONS}
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />
      <View className="h-4" />
      <Controller
        control={form.control}
        name="fullName"
        render={({ field, fieldState }) => (
          <TextField
            label="Full name"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            autoComplete="name"
            ref={field.ref}
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => form.setFocus('email')}
          />
        )}
      />
      <Controller
        control={form.control}
        name="email"
        render={({ field, fieldState }) => (
          <TextField
            label="Email"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect={false}
            keyboardType="email-address"
            ref={field.ref}
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => form.setFocus('password')}
          />
        )}
      />
      <Controller
        control={form.control}
        name="password"
        render={({ field, fieldState }) => (
          <TextField
            label="Password"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            secureTextEntry
            autoComplete="new-password"
            placeholder="8+ chars, upper & lower case, digit"
            ref={field.ref}
            returnKeyType="go"
            onSubmitEditing={submit}
          />
        )}
      />
      <Button
        title="Create account"
        onPress={submit}
        loading={isPending}
        className="mt-2"
      />
    </View>
  );
};
