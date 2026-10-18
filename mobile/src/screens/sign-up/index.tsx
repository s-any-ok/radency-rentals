import { useNavigation } from '@react-navigation/native';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';

import { SignUpForm } from 'src/features/sign-up';
import { AppNavigation } from 'src/shared/config';
import { ScreenContainer, ScreenHeader } from 'src/shared/ui';

export const SignUpScreen = () => {
  const { goBack } = useNavigation<AppNavigation>();

  return (
    <ScreenContainer edges={['top', 'bottom']}>
      <ScreenHeader
        title="Create account"
        onBack={goBack}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="px-6 pb-10 pt-2"
        >
          <SignUpForm />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
};
