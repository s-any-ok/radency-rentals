import { ReactElement } from 'react';

import { ErrorState } from './ErrorState';

type Props = {
  loading: boolean;
  /** Shown in place of the items while the first page loads. */
  skeleton: ReactElement;
  /** Set only when there is nothing to show; a failed background refetch keeps the old items. */
  errorMessage?: string | null;
  onRetry?: () => void;
  empty: ReactElement;
};

/** What a list renders when it has no items to show: skeleton → error → empty state. */
export const ListPlaceholder = ({ loading, skeleton, errorMessage, onRetry, empty }: Props) => {
  if (loading) return skeleton;
  if (errorMessage) {
    return (
      <ErrorState
        message={errorMessage}
        onRetry={onRetry}
      />
    );
  }
  return empty;
};
