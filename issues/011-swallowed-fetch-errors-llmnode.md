---
title: LLMNode silently swallows providers fetch errors
severity: high
category: bug
file: src/components/nodes/LLMNode.tsx:17-20
status: resolved
---

## Problem (original)
`LLMNode` fetched `/api/config/providers` to know which providers had system-level keys, then merged that with the user's localStorage tokens. The fetch's `.catch(() => {})` silently swallowed any failure, so the UI could mistakenly say "no providers configured" even when one was.

## Resolution
Resolved by the BYOK pivot (see [003](003-api-key-sent-from-client.md)):
- The `/api/config/providers` endpoint has been **deleted** entirely — there are no system providers to discover.
- `LLMNode.tsx` no longer fetches anything; the `useEffect` is gone.
- `configuredProviders` is now derived directly from `useApiTokenStore.tokens`, which is the single source of truth.

## Acceptance criteria
- [x] No fetch from `/api/config/providers` in `LLMNode.tsx`.
- [x] No empty `.catch(() => {})` in the file.
- [x] Model dropdown reflects only the providers the user has saved keys for.
