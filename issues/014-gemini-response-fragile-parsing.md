---
title: Gemini response parsing uses `as any` and fragile fallbacks
severity: high
category: bug
file: src/app/api/workflow/run/route.ts:122-140
---

## Problem
The image-extraction path for Gemini does multiple unguarded shape probes and at least one `blobPart as any` cast. The fallback branches are unclear, and the user-facing error string when nothing matches is generic.

## Why it matters
Google has changed the response shape of `generateContent` more than once across SDK versions. Without typed access and explicit shape assertions, a future SDK bump silently breaks image generation and the user sees a vague "no image returned" message with no debug clue.

## Suggested fix
- Use the SDK's typed response (`GenerateContentResult` from `@google/generative-ai`) and walk `result.response.candidates[0].content.parts` with type guards (`'inlineData' in part`).
- Replace `as any` with proper narrowing.
- On unmatched shape, log the raw response server-side (not to the client) and return a stable error like `{ error: 'gemini_unexpected_shape' }` so client code can match it.
- Add a small unit test (see [022](022-no-tests.md)) feeding a fixture response so future SDK bumps that change shape fail loudly in CI.

## Acceptance criteria
- [ ] No `as any` in the Gemini parsing branch.
- [ ] Type guards used to narrow parts.
- [ ] Failure case logs server-side and returns a stable error code.
- [ ] Unit test pinning the expected response shape.
