import { View } from 'react-native';

import { IconButton } from '../IconButton';
import { Text } from '../Text';

type Props = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
};

export const DataGridPagination = ({ page, pageSize, total, onPageChange }: Props) => {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <View className="flex-row items-center justify-between px-4 py-3">
      <Text variant="caption">
        {from}–{to} of {total}
      </Text>
      <View className="flex-row items-center gap-1">
        <IconButton
          icon="chevron-back"
          accessibilityLabel="Previous page"
          disabled={page <= 1}
          onPress={() => onPageChange(page - 1)}
          className={page <= 1 ? 'opacity-30' : undefined}
        />
        <Text variant="label">
          {page} / {pageCount}
        </Text>
        <IconButton
          icon="chevron-forward"
          accessibilityLabel="Next page"
          disabled={page >= pageCount}
          onPress={() => onPageChange(page + 1)}
          className={page >= pageCount ? 'opacity-30' : undefined}
        />
      </View>
    </View>
  );
};
