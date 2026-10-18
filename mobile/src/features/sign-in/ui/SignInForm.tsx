import { Controller } from 'react-hook-form';
import { View } from 'react-native';

import { Banner, Button, TextField } from 'src/shared/ui';

import { useSignInForm } from '../model/useSignInForm';

export const SignInForm = () => {
  const { form, submit, isPending, formError } = useSignInForm();

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
            placeholder="you@example.com"
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
            autoComplete="password"
            returnKeyType="go"
            onSubmitEditing={submit}
            ref={field.ref}
          />
        )}
      />
      <Button
        title="Sign in"
        onPress={submit}
        loading={isPending}
        className="mt-2"
      />
    </View>
  );
};
