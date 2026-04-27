import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Provider } from '@/lib/models';

type Tokens = Partial<Record<Provider, string>>;

type ApiTokenState = {
  tokens: Tokens;
  setToken: (provider: Provider, key: string) => void;
  removeToken: (provider: Provider) => void;
  getToken: (provider: Provider) => string | undefined;
};

export const useApiTokenStore = create<ApiTokenState>()(
  persist(
    (set, get) => ({
      tokens: {},
      setToken: (provider, key) =>
        set({ tokens: { ...get().tokens, [provider]: key } }),
      removeToken: (provider) => {
        const next = { ...get().tokens };
        delete next[provider];
        set({ tokens: next });
      },
      getToken: (provider) => get().tokens[provider],
    }),
    { name: 'weavy-api-tokens' }
  )
);

/**
 * Returns true once the persisted token store has rehydrated from localStorage.
 * Use this to avoid rendering the first-run gate on the server / before hydration,
 * which would briefly flash the onboarding screen for users that already have a key.
 */
export function useApiTokensHydrated(): boolean {
  // Initialise to false so SSR and the first client render agree (no
  // hydration mismatch). The persist middleware's hasHydrated()/
  // onFinishHydration() touch browser-only APIs, so we only consult them
  // inside useEffect.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    if (useApiTokenStore.persist.hasHydrated()) {
      setHydrated(true);
      return;
    }
    const unsub = useApiTokenStore.persist.onFinishHydration(() =>
      setHydrated(true),
    );
    return () => unsub();
  }, []);
  return hydrated;
}
