import { Text } from 'react-native';

type Props = { message?: string | null };

export const FieldError = ({ message }: Props) =>
  message ? <Text className="mt-1 text-xs text-danger-600">{message}</Text> : null;
