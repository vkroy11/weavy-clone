---
title: All workflow API routes are unauthenticated
severity: critical
category: security
file: src/app/api/workflow/{run,save,load}/route.ts
---

## Problem
None of `/api/workflow/run`, `/api/workflow/save`, or `/api/workflow/load` check the caller's identity. Anyone who can reach the server can:
- list every saved workflow (`GET /api/workflow/load`),
- overwrite any workflow by id (`POST /api/workflow/save` with a chosen id),
- run arbitrary LLM calls billed to the system Gemini/OpenAI key.

## Why it matters
This is fine for `localhost` development but an open door the moment this is deployed. An attacker can use `/api/workflow/run` as a free LLM proxy on the operator's dime, and `/api/workflow/save` allows tampering with any user's data once multi-user support exists.

## Suggested fix
Add at minimum a **same-origin check** + **rate limiting** before any deploy:
- Reject requests where `Origin` header doesn't match the configured app origin.
- Add IP-based rate limiting (e.g. via `@upstash/ratelimit` or a tiny in-memory bucket for single-instance dev).

For production, add real auth:
- Tie `Workflow` to an `ownerId` column in `prisma/schema.prisma`.
- Add an auth provider (NextAuth, Clerk, or a simple session cookie) and require a session on every API route.
- `load` returns only workflows where `ownerId === session.userId`.
- `save` enforces `ownerId` from session, never from the body.

## Acceptance criteria
- [ ] Decision: dev-only same-origin guard, OR full auth — recorded in README.
- [ ] Routes return 401/403 for unauthenticated callers under the chosen model.
- [ ] `Workflow` rows are scoped to an owner (if multi-user).
- [ ] A simple integration test or curl recipe demonstrates an unauthenticated call is rejected.
