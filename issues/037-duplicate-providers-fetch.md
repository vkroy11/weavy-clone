---
title: Duplicate `/api/config/providers` fetch in two components
severity: medium
category: quality
file: src/components/nodes/LLMNode.tsx:17 + src/components/settings/SettingsModal.tsx:24
status: resolved
---

## Problem (original)
Both `LLMNode.tsx` and `SettingsModal.tsx` fetched `/api/config/providers` with copy-pasted `useEffect` blocks, including the same broken `.catch(() => {})` (issues [011](011-swallowed-fetch-errors-llmnode.md) and [012](012-swallowed-fetch-errors-settings.md)).

## Resolution
Resolved by the BYOK pivot (see [003](003-api-key-sent-from-client.md)):
- The `/api/config/providers` endpoint and both consumer fetches are gone.
- The intended `useSystemProviders()` hook is no longer needed because there is no system data to fetch.
- Both components now read directly from `useApiTokenStore.tokens`, which already has built-in localStorage persistence and rehydration via the Zustand `persist` middleware.

## Acceptance criteria
- [x] Single source of truth for "what providers are configured" — `useApiTokenStore.tokens`.
- [x] No duplicated `useEffect` block across the two files.
