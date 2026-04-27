import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ClientIdState = {
  clientId: string | null;
  ensure: () => string;
};

/**
 * Per-browser identity. Generated lazily on first call to `ensure()` and
 * persisted to localStorage. We use this to scope server-stored workflows so
 * one browser doesn't see another browser's saved sessions. This is not auth
 * — it's session isolation. Anyone who copies the localStorage value can
 * impersonate the browser, and that's the explicit trade-off of BYOK + no
 * accounts.
 */
export const useClientIdStore = create<ClientIdState>()(
  persist(
    (set, get) => ({
      clientId: null,
      ensure: () => {
        const existing = get().clientId;
        if (existing) return existing;
        // Use crypto.randomUUID where available; fall back to a tiny shim
        // for older browsers / SSR safety.
        const fresh =
          typeof crypto !== 'undefined' && 'randomUUID' in crypto
            ? crypto.randomUUID()
            : `cid-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
        set({ clientId: fresh });
        return fresh;
      },
    }),
    { name: 'weavy-client-id' },
  ),
);

/**
 * SSR-safe accessor: returns null until the persisted store has rehydrated,
 * then the stable clientId. Mirrors the `useApiTokensHydrated` pattern so the
 * SessionPicker can wait for both before rendering.
 */
export function useClientId(): string | null {
  const [ready, setReady] = useState(false);
  const clientId = useClientIdStore((s) => s.clientId);
  const ensure = useClientIdStore((s) => s.ensure);

  useEffect(() => {
    if (useClientIdStore.persist.hasHydrated()) {
      ensure();
      setReady(true);
      return;
    }
    const unsub = useClientIdStore.persist.onFinishHydration(() => {
      ensure();
      setReady(true);
    });
    return () => unsub();
  }, [ensure]);

  return ready ? clientId : null;
}
