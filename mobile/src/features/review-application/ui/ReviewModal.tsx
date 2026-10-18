import { Controller, useWatch } from 'react-hook-form';

import type { ApplicationDto } from 'src/entities/application';
import { Banner, Button, ModalSheet, SegmentedControl, Text, TextField } from 'src/shared/ui';

import { useReviewForm } from '../model/useReviewForm';

const OUTCOMES = [
  { value: 'Approve' as const, label: 'Approve' },
  { value: 'Return' as const, label: 'Return' },
  { value: 'Deny' as const, label: 'Deny' },
];

const HINTS = {
  Approve: 'Issues a 12-month lease for the unit starting today.',
  Return: 'Sends the application back to the applicant to correct and resubmit.',
  Deny: 'Closes the application. This is final.',
} as const;

type Props = {
  visible: boolean;
  application: ApplicationDto;
  onClose: () => void;
};

export const ReviewModal = ({ visible, application, onClose }: Props) => {
  const { form, submit, saving, formError } = useReviewForm(application, visible, onClose);
  const outcome = useWatch({ control: form.control, name: 'outcome' });

  return (
    <ModalSheet
      visible={visible}
      title="Complete review"
      onClose={onClose}
      footer={
        <Button
          title={`${outcome} application`}
          variant={outcome === 'Deny' ? 'danger' : 'primary'}
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
      <Text
        variant="label"
        className="mb-1.5"
      >
        Outcome
      </Text>
      <Controller
        control={form.control}
        name="outcome"
        render={({ field }) => (
          <SegmentedControl
            options={OUTCOMES}
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />
      <Text
        variant="caption"
        className="mb-4 mt-2"
      >
        {HINTS[outcome]}
      </Text>
      <Controller
        control={form.control}
        name="comment"
        render={({ field, fieldState }) => (
          <TextField
            label={outcome === 'Approve' ? 'Comment (optional)' : 'Comment (required)'}
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            multiline
            textAlignVertical="top"
            placeholder="Shared with the applicant"
          />
        )}
      />
    </ModalSheet>
  );
};
