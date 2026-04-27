---
title: `alert()` used for user feedback after save
severity: medium
category: quality
file: src/components/layout/WorkflowCanvas.tsx:85
---

## Problem
The save handler uses `window.alert(...)` to tell the user the save succeeded or failed.

## Why it matters
- Blocks the entire page until dismissed.
- Looks unbranded and out of place against the rest of the dark UI.
- Doesn't compose: you can't show two notifications, can't auto-dismiss, can't link from one.

## Suggested fix
Pick a tiny toast lib (already-installed-friendly options: `sonner`). Add `<Toaster />` to the root layout once and replace `alert(...)` with `toast.success('Saved')` / `toast.error('Save failed: ...')`.

## Acceptance criteria
- [ ] No `alert()` calls remain in `WorkflowCanvas.tsx`.
- [ ] Saves show a toast top-right (or wherever `<Toaster />` is placed).
- [ ] Failures show a distinct error toast, not the same as success.
