import { PropsWithChildren, ReactNode } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconButton } from '../IconButton';
import { Text } from '../Text';

type Props = PropsWithChildren<{
  visible: boolean;
  title: string;
  onClose: () => void;
  footer?: ReactNode;
}>;

/** Bottom sheet style modal used for all editors (property, unit, residence, review). */
export const ModalSheet = ({ visible, title, onClose, footer, children }: Props) => {
  const { bottom } = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 justify-end"
      >
        <Pressable
          accessibilityLabel="Close"
          onPress={onClose}
          className="absolute inset-0 bg-ink-900/40"
        />
        <View className="max-h-[90%] rounded-t-3xl bg-white">
          <View className="flex-row items-center justify-between border-b border-ink-100 px-5 py-3">
            <Text variant="heading">{title}</Text>
            <IconButton
              icon="close"
              accessibilityLabel="Close"
              onPress={onClose}
            />
          </View>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerClassName="px-5 pt-4 pb-2"
          >
            {children}
          </ScrollView>
          {footer ? (
            <View
              className="border-t border-ink-100 px-5 pt-3"
              style={{ paddingBottom: bottom + 12 }}
            >
              {footer}
            </View>
          ) : (
            <View style={{ height: bottom + 12 }} />
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
