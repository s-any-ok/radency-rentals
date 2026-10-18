import { useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';

/** Subscribes to foreground/background changes. Pass a memoized listener. */
export const useAppState = (listener: (status: AppStateStatus) => void) => {
  useEffect(() => {
    const subscription = AppState.addEventListener('change', listener);
    return () => subscription.remove();
  }, [listener]);
};
