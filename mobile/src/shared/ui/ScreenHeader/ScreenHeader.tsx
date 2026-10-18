import { ReactNode } from 'react';
import { View } from 'react-native';

import { IconButton } from '../IconButton';
import { Text } from '../Text';

type Props = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: ReactNode;
};

export const ScreenHeader = ({ title, subtitle, onBack, right }: Props) => (
  <View className="flex-row items-center gap-2 px-4 pb-3 pt-2">
    {onBack && (
      <IconButton
        icon="chevron-back"
        accessibilityLabel="Back"
        onPress={onBack}
        className="-ml-2"
      />
    )}
    <View className="flex-1">
      <Text
        variant="title"
        numberOfLines={1}
      >
        {title}
      </Text>
      {subtitle ? (
        <Text
          variant="caption"
          numberOfLines={1}
        >
          {subtitle}
        </Text>
      ) : null}
    </View>
    {right}
  </View>
);
