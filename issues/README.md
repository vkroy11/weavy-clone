# Issues

A tracked backlog of bugs, security gaps, code-quality issues, and missing tests in this repo. One markdown file per issue, sorted by severity.

Each issue has frontmatter (`title`, `severity`, `category`, `file`) and four sections: **Problem**, **Why it matters**, **Suggested fix**, **Acceptance criteria**.

## Critical (do these first — secrets are leaked)

| # | Title | Category | File | Status |
|---|---|---|---|---|
| [001](001-rotate-leaked-gemini-key.md) | Rotate leaked Gemini API key and remove from repo | security | `.env:13` | open (env-var path is now dead code, but key is still leaked) |
| [002](002-leaked-prisma-database-url.md) | Rotate leaked Prisma Postgres URL and remove from repo | security | `.env:12` | open |
| [003](003-api-key-sent-from-client.md) | Stop sending user API keys from client to server | security | `src/hooks/useWorkflowExecution.ts:47-56` | **resolved** (BYOK-only architecture) |
| [004](004-unauthenticated-public-api.md) | All workflow API routes are unauthenticated | security | `src/app/api/workflow/*` | open |

## High

| # | Title | Category | File | Status |
|---|---|---|---|---|
| [010](010-save-upsert-creates-duplicates.md) | Save upsert creates duplicates instead of updating | bug | `src/app/api/workflow/save/route.ts:17-20` | **resolved** (sessions feature) |
| [011](011-swallowed-fetch-errors-llmnode.md) | LLMNode silently swallows providers fetch errors | bug | `src/components/nodes/LLMNode.tsx:17-20` | **resolved** (endpoint deleted) |
| [012](012-swallowed-fetch-errors-settings.md) | SettingsModal silently swallows providers fetch errors | bug | `src/components/settings/SettingsModal.tsx:24-27` | **resolved** (endpoint deleted) |
| [013](013-imagenode-no-onerror.md) | ImageNode FileReader has no onerror handler | bug | `src/components/nodes/ImageNode.tsx:13-21` | open |
| [014](014-gemini-response-fragile-parsing.md) | Gemini response parsing uses `as any` and fragile fallbacks | bug | `src/app/api/workflow/run/route.ts:122-140` | partially fixed (multimodal parts + better errors; `as any` remains) |
| [020](020-as-any-throughout.md) | `as any` casts throughout Sidebar and run route | quality | multiple | open |
| [021](021-zod-any-schemas.md) | Save route validates with `z.array(z.any())` | quality | `src/app/api/workflow/save/route.ts:8-9` | **resolved** (NodeSchema/EdgeSchema in `src/lib/schemas.ts`) |
| [022](022-no-tests.md) | No test infrastructure or tests exist | testing | repo | open |

## Medium

| # | Title | Category | File | Status |
|---|---|---|---|---|
| [030](030-image-base64-bloats-db.md) | Image base64 stored in workflow JSON bloats SQLite | perf | `src/components/nodes/ImageNode.tsx:18` | open |
| [031](031-no-pagination-on-load.md) | `/api/workflow/load` returns all workflows unpaginated | perf | `src/app/api/workflow/load/route.ts` | **mostly resolved** (50-row cap + slim list select; cursor pagination still missing) |
| [032](032-run-button-no-loading-state.md) | Run Flow button has no loading/disabled state | quality | `src/components/layout/WorkflowCanvas.tsx:167-172` | **resolved** (isRunning + spinner) |
| [033](033-no-input-error-messaging.md) | "No inputs" error doesn't name the offending node | quality | `src/hooks/useWorkflowExecution.ts:38-40` | **resolved** (error includes node label/id) |
| [034](034-undo-clone-is-slow.md) | Undo/redo deep-clones via JSON.parse(JSON.stringify) | perf | `src/store/useWorkflowStore.ts:44` | open |
| [035](035-magic-numbers-canvas-position.md) | Magic numbers in canvas drop position math | quality | `src/components/layout/WorkflowCanvas.tsx:104` | open |
| [036](036-alert-instead-of-toast.md) | `alert()` used for user feedback after save | quality | `src/components/layout/WorkflowCanvas.tsx:85` | **resolved** (replaced by inline save-status pill) |
| [037](037-duplicate-providers-fetch.md) | Duplicate `/api/config/providers` fetch in two components | quality | LLMNode + SettingsModal | **resolved** (endpoint deleted) |
| [038](038-hardcoded-fallback-model-id.md) | Hardcoded fallback model id in execution hook | quality | `src/hooks/useWorkflowExecution.ts:42` | partially fixed (now defaults to `gemini-3.1-flash-image-preview`; still hardcoded) |
| [039](039-console-log-in-prod-path.md) | `console.log(result)` left in production code path | quality | `src/hooks/useWorkflowExecution.ts:60` | **resolved** (removed during execution rewrite) |

## Low

| # | Title | Category | File | Status |
|---|---|---|---|---|
| [050](050-llm-image-alt-text.md) | Generated image has generic alt="Generated" | a11y | `src/components/nodes/LLMNode.tsx:95` | open |
| [051](051-app-metadata-still-default.md) | App metadata still says "Create Next App" | quality | `src/app/layout.tsx` | **resolved** (landing page work) |
| [052](052-readme-is-boilerplate.md) | README is the create-next-app template | quality | `README.md` | open |
| [060](060-template-query-param-not-wired.md) | Landing links to `/app?template=...` but editor ignores query | quality | `src/app/app/page.tsx` | open (landing follow-up) |

## How to use

- Pick the highest-severity unchecked item.
- Open its file, follow **Suggested fix**, and tick the **Acceptance criteria** as you go.
- When fixed, either delete the file or move it to `issues/done/` (your call).
- Critical security issues should be fixed before this repo is exposed beyond local dev.
