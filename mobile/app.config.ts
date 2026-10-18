import { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Radency Rentals',
  slug: 'radency-rentals',
  scheme: 'radencyrentals',
  version: '1.0.0',
  orientation: 'portrait',
  userInterfaceStyle: 'light',
  ios: {
    bundleIdentifier: 'com.radency.rentals',
    supportsTablet: false,
    infoPlist: {
      // The API runs over plain HTTP on the developer machine.
      NSAppTransportSecurity: { NSAllowsArbitraryLoads: true },
    },
  },
  android: {
    package: 'com.radency.rentals',
  },
  plugins: [
    'expo-secure-store',
    [
      'expo-build-properties',
      {
        // The API runs over plain HTTP on the developer machine.
        android: { usesCleartextTraffic: true },
      },
    ],
  ],
});
