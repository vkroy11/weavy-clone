---
title: Undo/redo deep-clones via JSON.parse(JSON.stringify)
severity: medium
category: perf
file: src/store/useWorkflowStore.ts:44
---

## Problem
Every state change calls `JSON.parse(JSON.stringify(nodes))` to push a snapshot onto the undo stack. The `.slice(-20)` cap is a bare magic number with no named constant.

## Why it matters
- `JSON.parse(JSON.stringify(...))` is the slowest way to clone; on a workflow with image-base64 nodes it's measurable. Worse, it silently drops `Date`, `Map`, `Set`, and `undefined`.
- Cap of 20 is opaque; readers can't tell why and changing it requires hunting the literal.

## Suggested fix
- Replace with `structuredClone(nodes)` (built into all evergreen browsers).
- For React-Flow node objects, even better: pull in `immer` and store snapshots as patches instead of full clones — much smaller memory footprint.
- Extract the cap: `const UNDO_HISTORY_LIMIT = 20;` at the top of the file.

## Acceptance criteria
- [ ] No `JSON.parse(JSON.stringify(...))` in the store.
- [ ] `UNDO_HISTORY_LIMIT` named and used.
- [ ] Undo/redo still passes manual smoke (and a unit test, see [022](022-no-tests.md)).
