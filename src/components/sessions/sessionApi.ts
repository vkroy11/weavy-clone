"use client";

import type { Node, Edge } from 'reactflow';

export type SessionSummary = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type FullSession = SessionSummary & {
  nodes: Node[];
  edges: Edge[];
};

export async function listSessions(clientId: string): Promise<SessionSummary[]> {
  const res = await fetch(`/api/workflow/load?clientId=${encodeURIComponent(clientId)}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Failed to load sessions' }));
    throw new Error(body.error || `Failed to load sessions (${res.status})`);
  }
  const data = (await res.json()) as SessionSummary[];
  return Array.isArray(data) ? data : [];
}

export async function loadSession(
  clientId: string,
  id: string,
): Promise<FullSession> {
  const res = await fetch(
    `/api/workflow/load?id=${encodeURIComponent(id)}&clientId=${encodeURIComponent(clientId)}`,
  );
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Failed to load workflow' }));
    throw new Error(body.error || `Failed to load workflow (${res.status})`);
  }
  return (await res.json()) as FullSession;
}

export async function deleteSession(clientId: string, id: string): Promise<void> {
  const res = await fetch('/api/workflow/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, clientId }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Failed to delete' }));
    throw new Error(body.error || `Failed to delete (${res.status})`);
  }
}
