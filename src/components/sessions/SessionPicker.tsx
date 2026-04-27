"use client";

import { useEffect, useState, type ReactNode } from 'react';
import {
  ArrowRight,
  FilePlus,
  History,
  Loader2,
  RefreshCw,
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
 * Shown when the user lands on /app and hasn't picked a session yet for this
 * tab. If they have prior sessions, they get a list to resume from. If not,
 * the picker auto-resolves and the editor is shown immediately.
 *
 * Once a session is loaded (or the user clicks "Start new"), `picked` flips
 * true and the editor (children) takes over for the rest of the tab session.
 */
export function SessionPicker({ children }: { children: ReactNode }) {
  const clientId = useClientId();
  const newWorkflow = useWorkflowStore((s) => s.newWorkflow);
  const loadWorkflow = useWorkflowStore((s) => s.loadWorkflow);
  const [sessions, setSessions] = useState<SessionSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [picked, setPicked] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // First fetch
  useEffect(() => {
    if (!clientId) return;
    if (picked) return;
    let cancelled = false;
    setError(null);
    setSessions(null);
    listSessions(clientId)
      .then((list) => {
        if (cancelled) return;
        setSessions(list);
        // Auto-skip the picker when there's nothing to pick from.
        if (list.length === 0) {
          newWorkflow();
          setPicked(true);
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load sessions');
      });
    return () => {
      cancelled = true;
    };
  }, [clientId, picked, newWorkflow]);

  if (picked) return <>{children}</>;

  // Wait for clientId hydration / first fetch.
  if (!clientId || sessions === null) {
    return (
      <div className="grid h-screen w-screen place-items-center bg-canvas">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 size={16} className="animate-spin" aria-hidden="true" />
          Loading your sessions…
        </div>
      </div>
    );
  }

  const handleResume = async (id: string) => {
    if (!clientId) return;
    setLoadingId(id);
    try {
      const full = await loadSession(clientId, id);
      loadWorkflow({
        id: full.id,
        name: full.name,
        nodes: full.nodes ?? [],
        edges: full.edges ?? [],
      });
      setPicked(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load workflow');
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    } finally {
      setDeletingId(null);
    }
  };

  const handleNew = () => {
    newWorkflow();
    setPicked(true);
  };

  const handleRefresh = () => {
    if (!clientId) return;
    setSessions(null);
    setError(null);
    listSessions(clientId)
      .then(setSessions)
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Failed to load sessions'),
      );
  };

  return (
    <div className="grid min-h-screen w-screen place-items-center bg-gradient-to-br from-[#0a0a0f] via-[#13131c] to-[#0a0a0f] p-6 text-[#f8fafc]">
      <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_30px_120px_-30px_rgba(124,58,237,0.6)] backdrop-blur-xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="inline-grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-[#7c3aed]/15">
            <History
              size={20}
              className="text-[#a78bfa]"
              aria-hidden="true"
            />
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 text-xs text-[#94a3b8] transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Refresh sessions"
          >
            <RefreshCw size={12} aria-hidden="true" />
            Refresh
          </button>
        </div>

        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Pick up where you left off
        </h1>
        <p className="mt-2 text-sm text-[#94a3b8]">
          {sessions.length === 1
            ? '1 saved workflow on this browser.'
            : `${sessions.length} saved workflows on this browser.`}{' '}
          Workflows auto-save while you work.
        </p>

        {error && (
          <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
            {error}
          </p>
        )}

        <ul className="mt-6 max-h-[55vh] space-y-2 overflow-y-auto pr-1">
          {sessions.map((s) => {
            const isLoading = loadingId === s.id;
            const isDeleting = deletingId === s.id;
            return (
              <li
                key={s.id}
                className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 p-3 transition-colors hover:bg-black/30"
              >
                <button
                  type="button"
                  onClick={() => handleResume(s.id)}
                  disabled={isLoading || isDeleting}
                  className="flex flex-1 cursor-pointer flex-col items-start gap-0.5 text-left disabled:cursor-wait"
                >
                  <span className="line-clamp-1 text-sm font-semibold text-white">
                    {s.name}
                  </span>
                  <span className="font-mono text-[11px] text-[#94a3b8]">
                    Updated {relativeTime(s.updatedAt)} · {s.id.slice(0, 8)}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => handleResume(s.id)}
                  disabled={isLoading || isDeleting}
                  className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg bg-[#7c3aed] px-3 text-xs font-semibold text-white transition-colors hover:bg-[#6d28d9] disabled:cursor-wait disabled:opacity-60"
                >
                  {isLoading ? (
                    <Loader2 size={12} className="animate-spin" aria-hidden="true" />
                  ) : (
                    <ArrowRight size={12} aria-hidden="true" />
                  )}
                  Resume
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(s.id)}
                  disabled={isLoading || isDeleting}
                  className="grid h-9 w-9 cursor-pointer place-items-center rounded-lg border border-white/10 text-[#94a3b8] transition-colors hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300 disabled:cursor-wait disabled:opacity-60"
                  aria-label={`Delete ${s.name}`}
                >
                  {isDeleting ? (
                    <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                  ) : (
                    <Trash2 size={14} aria-hidden="true" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        <div className="mt-6 border-t border-white/5 pt-5">
          <button
            type="button"
            onClick={handleNew}
            className="group inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            <FilePlus size={16} aria-hidden="true" />
            Start a new workflow
          </button>
        </div>
      </div>
    </div>
  );
}
