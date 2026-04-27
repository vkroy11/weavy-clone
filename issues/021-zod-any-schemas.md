---
title: Save route validates with `z.array(z.any())`
severity: high
category: quality
file: src/app/api/workflow/save/route.ts:8-9
---

## Problem
The Zod schema for the save endpoint uses `z.array(z.any())` for both `nodes` and `edges`. That accepts literally any shape — Zod is in the codebase but providing zero validation on the largest fields.

## Why it matters
Malformed workflows can be persisted and then crash the editor when they're loaded back. A malicious caller can store arbitrary garbage in the row. The whole point of having Zod was to prevent this.

## Suggested fix
Define real schemas mirroring the React Flow node/edge shape:

```ts
const NodeSchema = z.object({
  id: z.string(),
  type: z.enum(['text', 'image', 'llm']),
  position: z.object({ x: z.number(), y: z.number() }),
  data: z.record(z.unknown()),
});
const EdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  sourceHandle: z.string().nullable().optional(),
  targetHandle: z.string().nullable().optional(),
});
const WorkflowSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1).max(120),
  nodes: z.array(NodeSchema),
  edges: z.array(EdgeSchema),
});
```

Reuse the same schemas on the load route to validate what comes out of the DB.

## Acceptance criteria
- [ ] Save route rejects malformed nodes/edges with a 400 + Zod error message.
- [ ] Schemas live in a shared file (e.g. `src/lib/schemas.ts`) and are reused by load.
- [ ] No `z.any()` in workflow API routes.
