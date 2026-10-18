import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useReviewApplication, type ApplicationDto } from 'src/entities/application';
import { getErrorMessage, toApiError } from 'src/shared/api';
import { createId, submitChange } from 'src/shared/lib';

const reviewSchema = z
  .object({
    outcome: z.enum(['Approve', 'Return', 'Deny']),
    comment: z.string().trim().max(2000),
  })
  .refine((v) => v.outcome === 'Approve' || v.comment.length > 0, {
    path: ['comment'],
    message: 'A comment is required when returning or denying an application.',
  });

export type ReviewValues = z.infer<typeof reviewSchema>;

const DEFAULT_VALUES: ReviewValues = { outcome: 'Approve', comment: '' };

export const useReviewForm = (
  application: ApplicationDto,
  visible: boolean,
  onClose: () => void,
) => {
  const review = useReviewApplication();
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<ReviewValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: DEFAULT_VALUES,
  });
  const { reset, setError, handleSubmit } = form;

  useEffect(() => {
    if (visible) {
      reset(DEFAULT_VALUES);
      setFormError(null);
    }
  }, [visible, reset]);

  const submit = useCallback(
    () =>
      handleSubmit(async ({ outcome, comment }) => {
        setFormError(null);
        setSaving(true);
        try {
          await submitChange(review, {
            id: application.id,
            outcome,
            comment: comment.trim() || null,
            version: application.version,
            idempotencyKey: createId(),
            description: `Review (${outcome}) of ${application.applicantName}'s application`,
          });
          onClose();
        } catch (error) {
          const apiError = toApiError(error);
          if (apiError.fieldErrors.comment) {
            setError('comment', { message: apiError.fieldErrors.comment });
          } else {
            setFormError(getErrorMessage(error));
          }
        } finally {
          setSaving(false);
        }
      })(),
    [application, handleSubmit, onClose, review, setError],
  );

  return { form, submit, saving, formError };
};
