---
title: "No inputs" error doesn't name the offending node
severity: medium
category: quality
file: src/hooks/useWorkflowExecution.ts:38-40
---

## Problem
When an LLM node runs without any connected inputs the hook throws a generic message like `"no inputs"`. The user sees a toast / alert with no clue which node out of potentially many is the culprit.

## Why it matters
On a graph with five LLM nodes, "no inputs" requires the user to inspect each one. Friction that would be one line of code to remove.

## Suggested fix
Include the offending node's id and (if set) display label in the error message. Bonus: highlight the offending node on the canvas (set a transient `error: true` flag in its `data`, render with a red ring, clear on next run).

## Acceptance criteria
- [ ] Error message includes the node id or label.
- [ ] (Nice-to-have) Offending node visually marked on the canvas until the user starts editing it.
