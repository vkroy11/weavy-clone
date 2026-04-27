---
title: `as any` casts throughout Sidebar and run route
severity: high
category: quality
file: multiple
---

## Problem
Several places cast through `any` to bypass the type checker:

- `src/components/layout/Sidebar.tsx:24-25` — `PRODUCT_LISTING_GENERATOR.nodes as any`, `.edges as any`.
- `src/app/api/workflow/run/route.ts:114, 129-132` — Gemini SDK response parts cast as `any` (related: [014](014-gemini-response-fragile-parsing.md)).

## Why it matters
Each `as any` is a hole in the type system. SDK upgrades and refactors that change shapes silently compile and break only at runtime. We're paying for TypeScript without getting the safety.

## Suggested fix
- Type the prebuilt template properly: have `src/lib/prebuiltWorkflows.ts` export `Node[]` / `Edge[]` from `@xyflow/react` (or whatever the project uses) so the cast becomes unnecessary.
- For Gemini parsing, see [014](014-gemini-response-fragile-parsing.md) — use SDK types and `'key' in obj` guards.
- Add an ESLint rule `@typescript-eslint/no-explicit-any: error` once cleaned up so this doesn't regress.

## Acceptance criteria
- [ ] No `as any` in `Sidebar.tsx`.
- [ ] No `as any` in `route.ts`.
- [ ] ESLint rule prevents new `any` from creeping in.
