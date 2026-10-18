import { Ionicons } from '@expo/vector-icons';
import { ComponentProps } from 'react';
import { View } from 'react-native';

import { colors } from '../../const';
import { Text } from '../Text';

type IconName = ComponentProps<typeof Ionicons>['name'];

type EmptyProps = { icon?: IconName; title: string; message?: string };

export const EmptyState = ({ icon = 'file-tray-outline', title, message }: EmptyProps) => (
  <View className="items-center px-8 py-16">
    <Ionicons
      name={icon}
      size={40}
      color={colors.ink[300]}
    />
    <Text
      variant="heading"
      className="mt-3 text-center"
    >
      {title}
    </Text>
    {message ? (
      <Text
        tone="muted"
        className="mt-1 text-center"
      >
        {message}
      </Text>
    ) : null}
  </View>
);
