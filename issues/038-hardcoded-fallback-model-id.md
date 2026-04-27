---
title: Hardcoded fallback model id in execution hook
severity: medium
category: quality
file: src/hooks/useWorkflowExecution.ts:42
---

## Problem
The execution hook hardcodes `'imagen-4.0-generate-001'` as a fallback model id. It is not validated against the model registry in `src/lib/models.ts`.

## Why it matters
If Google retires that model id (or we remove it from the registry to surface a newer one), the fallback path silently 404s at runtime instead of failing at build time.

## Suggested fix
- Add `export const DEFAULT_IMAGE_MODEL = 'imagen-4.0-generate-001';` to `src/lib/models.ts`.
- Add a static assertion that `MODELS.some(m => m.id === DEFAULT_IMAGE_MODEL)` — fail at module load if the registry doesn't contain it.
- Import `DEFAULT_IMAGE_MODEL` in the hook.

## Acceptance criteria
- [ ] No model-id string literals outside `src/lib/models.ts`.
- [ ] Removing the default model from the registry causes an immediate, loud failure (not a silent runtime error).
