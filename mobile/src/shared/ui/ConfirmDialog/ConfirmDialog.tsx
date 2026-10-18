import { View } from 'react-native';

import { Button } from '../Button';
import { ModalSheet } from '../ModalSheet';
import { Text } from '../Text';

type Props = {
  visible: boolean;
  title: string;
  message: string;
  confirmTitle: string;
  destructive?: boolean;
  loading?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
};

export const ConfirmDialog = ({
  visible,
  title,
  message,
  confirmTitle,
  destructive,
  loading,
  error,
  onConfirm,
  onCancel,
}: Props) => (
  <ModalSheet
    visible={visible}
    title={title}
    onClose={onCancel}
    footer={
      <View className="flex-row gap-3">
        <Button
          title="Cancel"
          variant="secondary"
          onPress={onCancel}
          className="flex-1"
        />
        <Button
          title={confirmTitle}
          variant={destructive ? 'danger' : 'primary'}
          loading={loading}
          onPress={onConfirm}
          className="flex-1"
        />
      </View>
    }
  >
    <Text className="mb-3">{message}</Text>
    {error ? (
      <Text
        tone="danger"
        className="mb-2"
      >
        {error}
      </Text>
    ) : null}
  </ModalSheet>
);
