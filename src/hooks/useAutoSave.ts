"use client";

import { useEffect, useRef } from 'react';
import { useWorkflowStore } from '@/store/useWorkflowStore';
import { useClientId } from '@/store/useClientId';

const DEBOUNCE_MS = 1500;

/**
 * Auto-saves the current workflow to /api/workflow/save when the canvas is
 * marked dirty by the store. Debounces by DEBOUNCE_MS and aborts any in-flight
 * save when a newer edit comes in, so the last write always wins.
 *
 * On the very first save (no currentWorkflowId), the server creates a row and
 * returns its id; we then write the id back into the store so subsequent saves
 * update in place instead of creating duplicates.
 */
export function useAutoSave() {
  const clientId = useClientId();
  const saveState = useWorkflowStore((s) => s.saveState);
  const nodes = useWorkflowStore((s) => s.nodes);
  const edges = useWorkflowStore((s) => s.edges);
  const name = useWorkflowStore((s) => s.currentWorkflowName);
  const id = useWorkflowStore((s) => s.currentWorkflowId);

  const setSaveState = useWorkflowStore((s) => s.setSaveState);
  const setCurrentWorkflowId = useWorkflowStore((s) => s.setCurrentWorkflowId);

  const inFlight = useRef<AbortController | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!clientId) return;
    if (saveState !== 'dirty') return;
    // Empty canvases shouldn't create a row. Once the user actually adds
    // something, the next dirty tick will save.
    if (nodes.length === 0 && edges.length === 0 && !id) return;

    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      // Cancel any pending save — we only care about the latest snapshot.
      if (inFlight.current) inFlight.current.abort();
      const ac = new AbortController();
      inFlight.current = ac;

      setSaveState('saving');
      try {
        const res = await fetch('/api/workflow/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: id ?? undefined,
            clientId,
            name,
            nodes,
            edges,
          }),
          signal: ac.signal,
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({ error: 'Save failed' }));
          throw new Error(body.error || `Save failed (${res.status})`);
        }
        const saved = await res.json();
        if (saved?.id && saved.id !== id) {
          setCurrentWorkflowId(saved.id);
        }
        setSaveState('saved', { savedAt: Date.now() });
      } catch (err) {
        if ((err as { name?: string })?.name === 'AbortError') return;
        const message = err instanceof Error ? err.message : 'Save failed';
        setSaveState('error', { error: message });
      } finally {
        if (inFlight.current === ac) inFlight.current = null;
      }
    }, DEBOUNCE_MS);

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [
    clientId,
    saveState,
    nodes,
    edges,
    name,
    id,
    setSaveState,
    setCurrentWorkflowId,
  ]);
}
