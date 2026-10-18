import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { colors } from 'src/shared/const';

import { bootstrap } from './config/bootstrap';
import { RootNavigator } from './navigation';
import { QueryProvider } from './providers/QueryProvider';
import { SessionProvider } from './providers/SessionProvider';

bootstrap();

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary[600],
    background: colors.ink[50],
    card: colors.white,
  },
};

const App = () => (
  <SafeAreaProvider>
    <QueryProvider>
      <SessionProvider>
        <NavigationContainer theme={navigationTheme}>
          <StatusBar style="dark" />
          <RootNavigator />
        </NavigationContainer>
      </SessionProvider>
    </QueryProvider>
  </SafeAreaProvider>
);

export default App;
