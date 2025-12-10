import AsyncStorage from '@react-native-async-storage/async-storage';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import type { QueryClient } from '@tanstack/react-query';

export const PERSIST_KEY = 'react-query-offline-cache-v1';

type Persister = {
  persistClient: (client: unknown) => Promise<void>;
  restoreClient: () => Promise<unknown | undefined>;
  removeClient: () => Promise<void>;
};

export function setupQueryPersistence(
  queryClient: QueryClient,
  opts?: { maxAge?: number },
) {
  try {
    const persister: Persister = {
      persistClient: async client => {
        try {
          await AsyncStorage.setItem(PERSIST_KEY, JSON.stringify(client));
        } catch (e) {
          console.warn('persistClient failed', e);
        }
      },
      restoreClient: async () => {
        try {
          const raw = await AsyncStorage.getItem(PERSIST_KEY);
          return raw ? JSON.parse(raw) : undefined;
        } catch (e) {
          console.warn('restoreClient failed', e);
          return undefined;
        }
      },
      removeClient: async () => {
        try {
          await AsyncStorage.removeItem(PERSIST_KEY);
        } catch (e) {
          console.warn('removeClient failed', e);
        }
      },
    };

    // cast to any to satisfy type mismatch between library types in this workspace
    persistQueryClient({
      queryClient,
      persister: persister as any,
      maxAge: opts?.maxAge ?? 1000 * 60 * 60 * 24, // 24h
    } as any);
  } catch (e) {
    console.warn('setupQueryPersistence failed', e);
  }
}
