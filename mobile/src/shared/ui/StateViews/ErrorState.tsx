import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import { colors } from '../../const';
import { Button } from '../Button';
import { Text } from '../Text';

type ErrorProps = { message: string; onRetry?: () => void };

export const ErrorState = ({ message, onRetry }: ErrorProps) => (
  <View className="items-center px-8 py-16">
    <Ionicons
      name="alert-circle-outline"
      size={40}
      color={colors.danger[500]}
    />
    <Text className="mt-3 text-center">{message}</Text>
    {onRetry ? (
      <Button
        title="Try again"
        variant="secondary"
        size="sm"
        onPress={onRetry}
        className="mt-4"
      />
    ) : null}
  </View>
);
