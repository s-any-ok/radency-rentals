import { useCallback, useState } from 'react';
import { RefreshControl, RefreshControlProps } from 'react-native';

import { colors } from '../../const';

type Props = Omit<RefreshControlProps, 'refreshing' | 'onRefresh'> & {
  onRefresh: () => Promise<unknown>;
};

/**
 * Pull-to-refresh that spins only while the user's own pull is in flight. Background refetches
 * (focus, invalidation, new filters) stay silent instead of pushing the list down with a spinner.
 */
export const PullToRefresh = ({ onRefresh, ...props }: Props) => {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  }, [onRefresh]);

  return (
    <RefreshControl
      tintColor={colors.primary[600]}
      {...props}
      refreshing={refreshing}
      onRefresh={handleRefresh}
    />
  );
};
