---
title: `/api/workflow/load` returns all workflows unpaginated
severity: medium
category: perf
file: src/app/api/workflow/load/route.ts
---

## Problem
The list branch (no `?id=`) does `prisma.workflow.findMany()` with no `take`, no `skip`, and selects every column including the giant `nodes`/`edges` JSON.

## Why it matters
With even a few hundred saved workflows containing image base64 (issue [030](030-image-base64-bloats-db.md)), this response can hit tens of MB. Loading the workflow list page becomes painful or fails outright.

## Suggested fix
Two changes:

1. **Pagination**: accept `?limit=` (default 20, max 100) and `?cursor=` (id) and use Prisma's cursor pagination.
2. **Slim listing**: when listing, `select: { id: true, name: true, updatedAt: true }` — only return `nodes`/`edges` when the caller passes `?id=` to fetch a single workflow.

## Acceptance criteria
- [ ] Listing without `?id=` returns slim records (no nodes/edges).
- [ ] `?limit` / `?cursor` work and have a max-cap.
- [ ] Single-id fetch still returns the full workflow.
