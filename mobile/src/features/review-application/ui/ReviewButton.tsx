import { useCallback, useState } from 'react';

import type { ApplicationDto } from 'src/entities/application';
import { Button } from 'src/shared/ui';

import { ReviewModal } from './ReviewModal';

type Props = { application: ApplicationDto };

/**
 * Shown only while the server allows a review. The modal stays mounted while it is open: the
 * optimistic update clears `canReview` right away, and a rejected review must still be able to
 * show its error in the modal.
 */
export const ReviewButton = ({ application }: Props) => {
  const [open, setOpen] = useState(false);
  const show = useCallback(() => setOpen(true), []);
  const hide = useCallback(() => setOpen(false), []);

  if (!application.canReview && !open) return null;

  return (
    <>
      {application.canReview ? (
        <Button
          title="Review application"
          icon="checkmark-done-outline"
          onPress={show}
        />
      ) : null}
      <ReviewModal
        visible={open}
        application={application}
        onClose={hide}
      />
    </>
  );
};
