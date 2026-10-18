import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

import { SignInForm } from 'src/features/sign-in';
import { AppNavigation, ROUTE } from 'src/shared/config';
import { Button, Card, ScreenContainer, Text } from 'src/shared/ui';

export const SignInScreen = () => {
  const { navigate } = useNavigation<AppNavigation>();
  const openSignUp = useCallback(() => navigate(ROUTE.SIGN_UP), [navigate]);

  return (
    <ScreenContainer edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="flex-grow justify-center px-6 py-10"
        >
          <View className="mb-8">
            <Text variant="title">Welcome back</Text>
            <Text tone="muted">Sign in to manage rentals or apply for a home.</Text>
          </View>
          <SignInForm />
          <Button
            title="Create an account"
            variant="ghost"
            onPress={openSignUp}
            className="mt-3"
          />
          <Card className="mt-8 bg-ink-100">
            <Text variant="label">Demo accounts (password Radency123)</Text>
            <Text variant="caption">manager@radency.test · applicant@radency.test</Text>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
};
