"use client";

import { useEffect, useRef, useState } from 'react';
import {
  ChevronDown,
  FilePlus,
  History,
  Loader2,
  Trash2,
} from 'lucide-react';
import { useClientId } from '@/store/useClientId';
import { useWorkflowStore } from '@/store/useWorkflowStore';
import {
  deleteSession,
  listSessions,
  loadSession,
  type SessionSummary,
} from './sessionApi';
import { relativeTime } from './relativeTime';

/**
 * Toolbar dropdown for switching between saved workflows after the initial
 * session pick. Refetches the list each time it opens so a session that just
 * auto-saved appears without a manual reload.
 */
export function SessionsDropdown() {
  const clientId = useClientId();
  const currentId = useWorkflowStore((s) => s.currentWorkflowId);
  const loadWorkflow = useWorkflowStore((s) => s.loadWorkflow);
  const newWorkflow = useWorkflowStore((s) => s.newWorkflow);

  const [open, setOpen] = useState(false);
  const [sessions, setSessions] = useState<SessionSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  // Refresh list whenever the dropdown opens.
  useEffect(() => {
    if (!open || !clientId) return;
    let cancelled = false;
    setSessions(null);
    setError(null);
    listSessions(clientId)
      .then((list) => {
        if (!cancelled) setSessions(list);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load sessions');
      });
    return () => {
      cancelled = true;
    };
  }, [open, clientId]);

  // Click-outside close.
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener('mousedown', handler);
    return () => window.removeEventListener('mousedown', handler);
  }, [open]);

  const handleResume = async (id: string) => {
    if (!clientId || id === currentId) {
      setOpen(false);
      return;
    }
    setLoadingId(id);
    try {
      const full = await loadSession(clientId, id);
      loadWorkflow({
        id: full.id,
        name: full.name,
        nodes: full.nodes ?? [],
        edges: full.edges ?? [],
      });
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load workflow');
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!clientId) return;
    if (!confirm('Delete this workflow? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await deleteSession(clientId, id);
      setSessions((prev) => (prev ? prev.filter((s) => s.id !== id) : prev));
      // If the user deleted the current workflow, fall back to a fresh canvas.
      if (id === currentId) newWorkflow();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    } finally {
      setDeletingId(null);
    }
  };

  const handleNew = () => {
    newWorkflow();
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-gray-600 transition-colors hover:bg-canvas"
        title="Sessions"
      >
        <History size={18} aria-hidden="true" />
        <span className="text-xs font-semibold">Sessions</span>
        <ChevronDown size={14} aria-hidden="true" />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-2xl border border-node-border bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-node-border px-3 py-2.5">
            <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
              Saved workflows
            </span>
            <button
              type="button"
              onClick={handleNew}
              className="inline-flex h-7 cursor-pointer items-center gap-1 rounded-md bg-primary px-2 text-[11px] font-semibold text-white hover:bg-primary/90"
            >
              <FilePlus size={11} aria-hidden="true" />
              New
            </button>
          </div>

          {error && (
            <div className="px-3 py-2 text-xs text-red-600">{error}</div>
          )}

          {sessions === null ? (
            <div className="flex items-center gap-2 px-3 py-4 text-xs text-gray-500">
              <Loader2 size={12} className="animate-spin" aria-hidden="true" />
              Loading…
            </div>
          ) : sessions.length === 0 ? (
            <div className="px-3 py-6 text-center text-xs text-gray-400">
              No saved workflows yet. Edits auto-save as you work.
            </div>
          ) : (
            <ul className="max-h-[60vh] overflow-y-auto py-1">
              {sessions.map((s) => {
                const isLoading = loadingId === s.id;
                const isDeleting = deletingId === s.id;
                const isCurrent = s.id === currentId;
                return (
                  <li
                    key={s.id}
                    className={`group flex items-center gap-2 px-2 py-1.5 ${
                      isCurrent ? 'bg-primary/5' : 'hover:bg-canvas'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleResume(s.id)}
                      disabled={isLoading || isDeleting}
                      className="flex flex-1 cursor-pointer flex-col items-start gap-0 px-2 py-1 text-left disabled:cursor-wait"
                    >
                      <span className="line-clamp-1 text-sm font-semibold text-gray-800">
                        {s.name}
                      </span>
                      <span className="font-mono text-[10px] text-gray-400">
                        {relativeTime(s.updatedAt)}
                        {isCurrent ? ' · current' : ''}
                      </span>
                    </button>
                    {isLoading && (
                      <Loader2
                        size={12}
                        className="animate-spin text-gray-500"
                        aria-hidden="true"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(s.id)}
                      disabled={isLoading || isDeleting}
                      className="grid h-7 w-7 cursor-pointer place-items-center rounded-md text-gray-400 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100 disabled:cursor-wait disabled:opacity-60"
                      aria-label={`Delete ${s.name}`}
                    >
                      {isDeleting ? (
                        <Loader2
                          size={12}
                          className="animate-spin"
                          aria-hidden="true"
                        />
                      ) : (
                        <Trash2 size={12} aria-hidden="true" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
