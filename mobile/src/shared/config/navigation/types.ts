import { NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ROUTE, STACK_ROUTE } from './routes';

export type MainTabParamList = {
  [ROUTE.PROPERTIES]: undefined;
  [ROUTE.AVAILABLE_UNITS]: undefined;
  [ROUTE.APPLICATIONS]: undefined;
  [ROUTE.ACCOUNT]: undefined;
};

export type AppStackParamList = {
  [ROUTE.SIGN_IN]: undefined;
  [ROUTE.SIGN_UP]: undefined;
  [STACK_ROUTE.MAIN_TABS]: NavigatorScreenParams<MainTabParamList> | undefined;
  [ROUTE.PROPERTY_DETAILS]: { propertyId: string };
  [ROUTE.APPLICATION]: { applicationId: string };
};

export type AppNavigation = NativeStackNavigationProp<AppStackParamList>;
