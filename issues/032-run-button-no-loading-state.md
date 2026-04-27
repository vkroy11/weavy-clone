---
title: Run Flow button has no loading/disabled state
severity: medium
category: quality
file: src/components/layout/WorkflowCanvas.tsx:167-172
---

## Problem
"Run Flow" can be clicked repeatedly while a previous run is in flight. There's no `disabled` attribute, no spinner, and no per-click guard. Each click kicks off another full execution.

## Why it matters
- Confused users assume "nothing happened" and click again, multiplying API costs.
- Concurrent runs against the same canvas race to write outputs into LLM nodes, producing whichever response returns last.

## Suggested fix
- Add an `isRunning` boolean to the workflow store (or local component state).
- Set it true at the start of `useWorkflowExecution`, false in a `finally`.
- Bind it to the Run button's `disabled` and swap the icon for a spinning loader (`Loader2` from `lucide-react`, `animate-spin`).
- Also lock the Save and Import buttons during a run for safety.

## Acceptance criteria
- [ ] Run Flow button is disabled while a run is in flight.
- [ ] Visible spinner replaces the play icon during execution.
- [ ] No double-execution possible from rapid clicks.
