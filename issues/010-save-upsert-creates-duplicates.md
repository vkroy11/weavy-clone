---
title: Save upsert creates duplicates instead of updating
severity: high
category: bug
file: src/app/api/workflow/save/route.ts:17-20
---

## Problem
The save route does:

```ts
prisma.workflow.upsert({
  where: { id: id || '' },
  create: { ... },
  update: { ... },
})
```

When the client doesn't yet have an id (first save), `id || ''` is an empty string, which never matches an existing row, so `create` runs. Prisma assigns a fresh id but the **client never receives it back into its store**, so the next save also has no id and creates *another* row. Result: every "save" without coordination produces a new workflow.

## Why it matters
- Database fills with duplicates.
- Users expect a single "my current workflow" row that updates as they edit.
- Breaks the implicit "Save" → "Save again later" flow.

## Suggested fix
Branch on whether `id` is truthy, and return the new id to the client so subsequent saves update:

```ts
const data = { name, nodes, edges };
const workflow = id
  ? await prisma.workflow.update({ where: { id }, data })
  : await prisma.workflow.create({ data });
return NextResponse.json(workflow);
```

Then in the client (`WorkflowCanvas.tsx` save handler) capture `workflow.id` into the store so the next `save` posts it.

## Acceptance criteria
- [ ] Calling save twice on the same canvas produces exactly one row.
- [ ] Returned id is stored client-side and reused.
- [ ] No reliance on `where: { id: '' }` anti-pattern.
