---
title: Magic numbers in canvas drop position math
severity: medium
category: quality
file: src/components/layout/WorkflowCanvas.tsx:104
---

## Problem
The drop handler computes node position as `{ x: event.clientX - 300, y: event.clientY - 50 }`. The `300` and `50` are presumably the sidebar width and header height, but this is left to the reader to deduce.

## Why it matters
If the sidebar width changes in `Sidebar.tsx`, the drop position silently desyncs and dropped nodes land in the wrong place. There's no way to grep for "where does the 300 come from".

## Suggested fix
- Define a single source of truth for these dimensions, e.g. in `src/lib/layout.ts`:
  ```ts
  export const SIDEBAR_WIDTH_PX = 300;
  export const HEADER_HEIGHT_PX = 50;
  ```
- Import in both `Sidebar.tsx` (for its width style) and `WorkflowCanvas.tsx` (for the drop math).
- Even better: use `containerRef.getBoundingClientRect()` so the math works regardless of the sidebar size.

## Acceptance criteria
- [ ] No raw `300` / `50` magic numbers in `WorkflowCanvas.tsx`.
- [ ] Sidebar width is set from the same constant the drop math uses.
