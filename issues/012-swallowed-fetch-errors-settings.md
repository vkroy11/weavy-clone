---
title: SettingsModal silently swallows providers fetch errors
severity: high
category: bug
file: src/components/settings/SettingsModal.tsx:24-27
status: resolved
---

## Problem (original)
Same anti-pattern as [011](011-swallowed-fetch-errors-llmnode.md): the modal fetched `/api/config/providers` with a swallowed `.catch(() => {})`, leaving the "system key active" UI in a stale state on failure.

## Resolution
Resolved by the BYOK pivot (see [003](003-api-key-sent-from-client.md)):
- `SettingsModal` no longer fetches `/api/config/providers` — the endpoint is gone.
- The "System key active" badge has been removed from the UI (it was always wrong; there is no system key).
- The footer text now reads: "Keys are stored only in your browser's localStorage. Weavy doesn't send them anywhere except the model provider you chose."

## Acceptance criteria
- [x] No `useEffect` fetching `/api/config/providers` in `SettingsModal.tsx`.
- [x] No "system key active" branch in the UI.
