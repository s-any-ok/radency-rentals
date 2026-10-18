import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ApplicationScreen } from 'src/screens/application';
import { PropertyDetailsScreen } from 'src/screens/property-details';
import { SignInScreen } from 'src/screens/sign-in';
import { SignUpScreen } from 'src/screens/sign-up';
import { AppStackParamList, ROUTE, STACK_ROUTE } from 'src/shared/config';
import { useSessionStatus } from 'src/shared/model';

import { MainTabs } from './MainTabs';

const Stack = createNativeStackNavigator<AppStackParamList>();

/** Signed-out users only get the auth screens; signing in/out swaps the whole stack. */
export const RootNavigator = () => {
  const isSignedIn = useSessionStatus() === 'signedIn';

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isSignedIn ? (
        <>
          <Stack.Screen
            name={STACK_ROUTE.MAIN_TABS}
            component={MainTabs}
          />
          <Stack.Screen
            name={ROUTE.PROPERTY_DETAILS}
            component={PropertyDetailsScreen}
          />
          <Stack.Screen
            name={ROUTE.APPLICATION}
            component={ApplicationScreen}
          />
        </>
      ) : (
        <>
          <Stack.Screen
            name={ROUTE.SIGN_IN}
            component={SignInScreen}
          />
          <Stack.Screen
            name={ROUTE.SIGN_UP}
            component={SignUpScreen}
          />
        </>
      )}
    </Stack.Navigator>
  );
};
