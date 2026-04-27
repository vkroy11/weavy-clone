---
title: `console.log(result)` left in production code path
severity: medium
category: quality
file: src/hooks/useWorkflowExecution.ts:60
---

## Problem
`console.log(result)` is in the success branch of `useWorkflowExecution`. It runs on every workflow execution, in production builds.

## Why it matters
- Spams the user's devtools with potentially large payloads (image bytes inline).
- May leak portions of API responses into screen recordings, support sessions, error monitors.

## Suggested fix
Remove it, or guard with `if (process.env.NODE_ENV !== 'production') console.debug(...)`. Even better: introduce a tiny `src/lib/log.ts` that no-ops in production and centralises debug output.

## Acceptance criteria
- [ ] No bare `console.log` left in `useWorkflowExecution.ts`.
- [ ] If logging is kept, it's gated on `NODE_ENV !== 'production'`.
