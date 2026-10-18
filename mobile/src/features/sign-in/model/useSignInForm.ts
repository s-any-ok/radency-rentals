import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useSignIn } from 'src/entities/session';
import { getErrorMessage } from 'src/shared/api';

const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required.')
    .pipe(z.email('Enter a valid email address.')),
  password: z.string().min(1, 'Password is required.'),
});

type SignInValues = z.infer<typeof signInSchema>;

export const useSignInForm = () => {
  const { mutateAsync, isPending } = useSignIn();
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  });

  const submit = useCallback(
    () =>
      form.handleSubmit(async (values) => {
        setFormError(null);
        try {
          await mutateAsync({ email: values.email.trim(), password: values.password });
        } catch (error) {
          setFormError(getErrorMessage(error));
        }
      })(),
    [form, mutateAsync],
  );

  return { form, submit, isPending, formError };
};
