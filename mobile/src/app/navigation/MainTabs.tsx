import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ComponentProps } from 'react';

import { AccountScreen } from 'src/screens/account';
import { ApplicationsScreen } from 'src/screens/applications';
import { AvailableUnitsScreen } from 'src/screens/available-units';
import { PropertiesScreen } from 'src/screens/properties';
import { MainTabParamList, ROUTE } from 'src/shared/config';
import { colors } from 'src/shared/const';
import { useIsPropertyManager } from 'src/shared/model';

const Tab = createBottomTabNavigator<MainTabParamList>();

type IconName = ComponentProps<typeof Ionicons>['name'];

const TAB_ICONS: Record<keyof MainTabParamList, IconName> = {
  [ROUTE.PROPERTIES]: 'business-outline',
  [ROUTE.AVAILABLE_UNITS]: 'search-outline',
  [ROUTE.APPLICATIONS]: 'documents-outline',
  [ROUTE.ACCOUNT]: 'person-circle-outline',
};

/** Tabs depend on the role: managers manage properties, applicants browse available units. */
export const MainTabs = () => {
  const isManager = useIsPropertyManager();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary[600],
        tabBarInactiveTintColor: colors.ink[400],
        tabBarIcon: ({ color, size }) => (
          <Ionicons
            name={TAB_ICONS[route.name]}
            size={size}
            color={color}
          />
        ),
      })}
    >
      {isManager ? (
        <Tab.Screen
          name={ROUTE.PROPERTIES}
          component={PropertiesScreen}
          options={{ title: 'Properties' }}
        />
      ) : (
        <Tab.Screen
          name={ROUTE.AVAILABLE_UNITS}
          component={AvailableUnitsScreen}
          options={{ title: 'Browse' }}
        />
      )}
      <Tab.Screen
        name={ROUTE.APPLICATIONS}
        component={ApplicationsScreen}
        options={{ title: 'Applications' }}
      />
      <Tab.Screen
        name={ROUTE.ACCOUNT}
        component={AccountScreen}
        options={{ title: 'Account' }}
      />
    </Tab.Navigator>
  );
};
