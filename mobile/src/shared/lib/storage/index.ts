import { MMKV } from 'react-native-mmkv';
import type { StateStorage } from 'zustand/middleware';

/** Fast synchronous key-value storage for non-sensitive data (query cache, UI state). */
export const storage = new MMKV({ id: 'radency-rentals' });

/** Adapter for zustand's persist middleware. */
export const zustandStorage: StateStorage = {
  getItem: (name) => storage.getString(name) ?? null,
  setItem: (name, value) => storage.set(name, value),
  removeItem: (name) => storage.delete(name),
};

/** Adapter for TanStack Query's sync storage persister. */
export const queryCacheStorage = {
  getItem: (key: string) => storage.getString(key) ?? null,
  setItem: (key: string, value: string) => storage.set(key, value),
  removeItem: (key: string) => storage.delete(key),
};
