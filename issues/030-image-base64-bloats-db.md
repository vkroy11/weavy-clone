---
title: Image base64 stored in workflow JSON bloats SQLite
severity: medium
category: perf
file: src/components/nodes/ImageNode.tsx:18
---

## Problem
`ImageNode` reads the user-uploaded file as a base64 data URL via `FileReader.readAsDataURL` and stuffs the entire string into the node's `data`. When the workflow is saved, the whole base64 image goes into the `Workflow.nodes` JSON column, which Prisma serialises into the SQLite row.

A 2 MB JPEG becomes ~2.7 MB of base64 inside a JSON string inside one DB row, plus a copy in any list response.

## Why it matters
- DB grows fast and unpredictably with every save.
- `/api/workflow/load` returns these huge rows even when the caller just wants a list.
- Workflow JSON exports become unmanageable.

## Suggested fix
Separate image storage from workflow definition:

- Add an `Asset` table: `{ id, mimeType, bytes (Bytes), createdAt }` (or store on disk / S3 in production).
- On image upload, POST the file to `/api/assets`, store, return `{ id }`.
- The node's `data` only holds the asset id + a thumbnail data URL for preview.
- On run, the server fetches the asset by id and feeds it to the model.

Quick interim fix if a full asset table is too much: use `URL.createObjectURL(file)` for the on-canvas preview and only base64-encode at run-time in `useWorkflowExecution`, so saved workflows never carry the bytes.

## Acceptance criteria
- [ ] Saved workflow rows do not contain raw base64 image bytes.
- [ ] Image preview still works on the canvas.
- [ ] `useWorkflowExecution` still feeds bytes to the model on run.
