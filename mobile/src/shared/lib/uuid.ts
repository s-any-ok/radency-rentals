import { randomUUID } from 'expo-crypto';

/** Client-generated ids make create requests idempotent when they are replayed after being offline. */
export const createId = (): string => randomUUID();

export const EMPTY_GUID = '00000000-0000-0000-0000-000000000000';
