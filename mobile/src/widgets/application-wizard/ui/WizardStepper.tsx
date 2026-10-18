import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import type { ApplicationDto } from 'src/entities/application';
import { colors } from 'src/shared/const';
import { cn } from 'src/shared/lib';

import { isStepCompleted, WIZARD_STEPS } from '../model/steps';

type Props = {
  application: ApplicationDto;
  stepIndex: number;
  onSelect: (index: number) => void;
};

export const WizardStepper = ({ application, stepIndex, onSelect }: Props) => (
  <View className="flex-row items-center px-4 pb-4">
    {WIZARD_STEPS.map((step, index) => {
      const active = index === stepIndex;
      const done = isStepCompleted(application, step.key);

      return (
        <View
          key={step.key}
          className="flex-1 flex-row items-center"
        >
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => onSelect(index)}
            className="items-center"
          >
            <View
              className={cn(
                'h-8 w-8 items-center justify-center rounded-full border-2',
                active
                  ? 'border-primary-600 bg-primary-600'
                  : done
                    ? 'border-success-600 bg-success-600'
                    : 'border-ink-300 bg-white',
              )}
            >
              {done && !active ? (
                <Ionicons
                  name="checkmark"
                  size={16}
                  color={colors.white}
                />
              ) : (
                <Text className={cn('text-sm font-bold', active ? 'text-white' : 'text-ink-500')}>
                  {index + 1}
                </Text>
              )}
            </View>
            <Text
              className={cn(
                'mt-1 text-xs',
                active ? 'font-semibold text-primary-700' : 'text-ink-500',
              )}
            >
              {step.title}
            </Text>
          </Pressable>
          {index < WIZARD_STEPS.length - 1 && (
            <View className="mx-1 mb-4 h-0.5 flex-1 bg-ink-200" />
          )}
        </View>
      );
    })}
  </View>
);
