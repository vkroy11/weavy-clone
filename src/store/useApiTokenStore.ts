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
        const { [provider]: _, ...rest } = get().tokens;
        set({ tokens: rest });
      },
      getToken: (provider) => get().tokens[provider],
    }),
    { name: 'weavy-api-tokens' }
  )
);
