import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

export const initializeNetInfo = () => {
  // The HTTP reachability probe gives false negatives behind VPNs, so rely on the OS flag only.
  NetInfo.configure({
    useNativeReachability: false,
    reachabilityShouldRun: () => false,
  });
};

export const isNetworkConnected = (state: NetInfoState): boolean => state.isConnected !== false;
