import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useSignUp } from 'src/entities/session';
import { toApiError } from 'src/shared/api';

const signUpSchema = z.object({
  fullName: z.string().trim().min(1, 'Name is required.').max(200),
  email: z
    .string()
    .trim()
    .min(1, 'Email is required.')
    .pipe(z.email('Enter a valid email address.')),
  password: z
    .string()
    .min(8, 'At least 8 characters.')
    .regex(/[a-z]/, 'Add a lowercase letter.')
    .regex(/[A-Z]/, 'Add an uppercase letter.')
    .regex(/\d/, 'Add a digit.'),
  // For convenience the user picks their role at sign-up (as the task allows).
  role: z.enum(['Applicant', 'PropertyManager']),
});

export type SignUpValues = z.infer<typeof signUpSchema>;

export const useSignUpForm = () => {
  const { mutateAsync, isPending } = useSignUp();
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { fullName: '', email: '', password: '', role: 'Applicant' },
  });

  const submit = useCallback(
    () =>
      form.handleSubmit(async (values) => {
        setFormError(null);
        try {
          await mutateAsync({
            ...values,
            email: values.email.trim(),
            fullName: values.fullName.trim(),
          });
        } catch (error) {
          const apiError = toApiError(error);
          // Server-side field errors (e.g. "email already taken") go next to their field.
          const fields = Object.entries(apiError.fieldErrors).filter(([field]) =>
            ['email', 'password', 'fullName'].includes(field),
          );
          fields.forEach(([field, message]) =>
            form.setError(field as keyof SignUpValues, { message }),
          );
          if (fields.length === 0) setFormError(apiError.message);
        }
      })(),
    [form, mutateAsync],
  );

  return { form, submit, isPending, formError };
};
