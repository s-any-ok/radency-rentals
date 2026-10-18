import { PropsWithChildren, useEffect, useRef } from 'react';
import { Animated } from 'react-native';

const PULSE_MS = 700;
const PULSE_MIN_OPACITY = 0.4;

/** Pulses a whole placeholder group with a single native-driven animation. */
export const SkeletonPulse = ({ children }: PropsWithChildren) => {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: PULSE_MIN_OPACITY,
          duration: PULSE_MS,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, { toValue: 1, duration: PULSE_MS, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      accessibilityRole="progressbar"
      accessibilityLabel="Loading"
      style={{ opacity }}
    >
      {children}
    </Animated.View>
  );
};
