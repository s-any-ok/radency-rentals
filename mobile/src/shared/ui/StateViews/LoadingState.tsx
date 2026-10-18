import { ActivityIndicator, View } from 'react-native';

import { colors } from '../../const';

export const LoadingState = () => (
  <View className="flex-1 items-center justify-center py-16">
    <ActivityIndicator color={colors.primary[600]} />
  </View>
);
