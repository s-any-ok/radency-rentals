import * as SecureStore from 'expo-secure-store';

/** Tokens live in the Keychain (iOS) / Keystore-backed storage (Android), never in plain storage. */
const TOKENS_KEY = 'auth.tokens';

export type StoredTokens = {
  accessToken: string;
  refreshToken: string;
  /** Epoch milliseconds when the access token expires. */
  expiresAt: number;
};

export const saveTokens = (tokens: StoredTokens): Promise<void> =>
  SecureStore.setItemAsync(TOKENS_KEY, JSON.stringify(tokens));

export const loadTokens = async (): Promise<StoredTokens | null> => {
  try {
    const raw = await SecureStore.getItemAsync(TOKENS_KEY);
    return raw ? (JSON.parse(raw) as StoredTokens) : null;
  } catch {
    return null;
  }
};

export const clearTokens = (): Promise<void> => SecureStore.deleteItemAsync(TOKENS_KEY);
