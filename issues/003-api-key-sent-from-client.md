---
title: Stop sending user API keys from client to server
severity: critical
category: security
file: src/hooks/useWorkflowExecution.ts:47-56
status: resolved-architecturally
---

## Problem (original)
The browser stored the user's Gemini/OpenAI key in `localStorage` (via `useApiTokenStore`) and posted it in the body of every call to `/api/workflow/run`. The key was therefore exposed to:
- the browser's `localStorage` (any XSS = total takeover),
- the network (proxies, browser extensions, devtools),
- the server's request logs.

There was *also* a server-side env-var fallback (`process.env.GEMINI_API_KEY` / `OPENAI_API_KEY`) which meant a deployed instance could share one key across every visitor — turning the app into a free LLM proxy on the operator's dime.

## Resolution: strict BYOK
Architecture decision (confirmed): **Option B (BYOK)** with stricter shape than originally outlined.

- The env-var fallback paths in `src/app/api/workflow/run/route.ts` have been **removed**. There is no system key, no free tier, no proxy.
- `apiKey` is now a **required** field on the `/api/workflow/run` schema. Missing it returns a 400 with a friendly "open Settings and save a key" message.
- A new `FirstRunGate` (`src/components/onboarding/FirstRunGate.tsx`) blocks the `/app` editor on first visit until the user has saved at least one provider key.
- `useApiTokenStore` continues to persist keys to `localStorage` — that's the explicit product trade-off. Documented inline on the gate and in the Settings modal.

## Remaining work (deferred, lower severity)
- `localStorage` is still XSS-vulnerable. If the app ever embeds untrusted content, switch the persist driver to in-memory only so keys die with the tab. Open a new issue if/when that risk surfaces.
- The Settings modal text already states "Keys are stored only in your browser's localStorage. Weavy doesn't send them anywhere except the model provider you chose." — keep this honest if architecture changes.

## Acceptance criteria
- [x] Decision recorded (this file + the gate copy on `/app`).
- [x] `/api/workflow/run` ignores `process.env.*_API_KEY` and requires `apiKey` in the body.
- [x] First-run gate blocks the editor until a key is saved.
- [x] Settings modal no longer shows a "system key active" badge — there is no system key.
