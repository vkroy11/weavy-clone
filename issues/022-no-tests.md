---
title: No test infrastructure or tests exist
severity: high
category: testing
file: repo
---

## Problem
There are zero test files in the repo and no test runner configured in `package.json`. There is also no CI.

## Why it matters
Every change is shipped on hope. The most fragile parts of the codebase — Gemini response parsing, the workflow execution hook, the undo/redo store — have no safety net. As the surface grows, regressions become inevitable.

## Suggested fix
Set up Vitest + React Testing Library (Vitest plays well with Next 16 + ESM):

```bash
npm i -D vitest @testing-library/react @testing-library/jest-dom jsdom @vitejs/plugin-react
```

Add `vitest.config.ts` with `jsdom` environment, and a `test` script in `package.json`. Seed with three high-value tests:

1. `src/store/useWorkflowStore.test.ts` — undo/redo correctness, snapshot cap of 20.
2. `src/hooks/useWorkflowExecution.test.ts` — topological-order execution, error path when a node has no inputs.
3. `src/app/api/workflow/save/route.test.ts` — POST with valid + invalid bodies (uses the Zod schema from [021](021-zod-any-schemas.md)).

Add a GitHub Actions workflow that runs `npm test` and `npm run lint` on PRs.

## Acceptance criteria
- [ ] `npm test` runs and passes.
- [ ] At least the three seed tests above exist and pass.
- [ ] CI workflow runs tests on push/PR.
