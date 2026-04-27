---
title: Landing links to `/app?template=...` but editor ignores query
severity: low
category: quality
file: src/app/app/page.tsx
---

## Problem
The new landing page's UseCases section links to `/app?template=product-listing` so users can deep-link into a starting template. The editor at `/app` does not read this query parameter, so the link currently behaves like a plain "Launch app" — the user has to load the template manually from the sidebar.

## Why it matters
Minor — the link still works, it just doesn't preselect the template. Worth wiring up so the landing CTAs actually deliver on what they imply.

## Suggested fix
- In `src/app/app/page.tsx` (or a child of it), read `useSearchParams()` once on mount.
- If `template` matches a known prebuilt id, dispatch the same Zustand action the sidebar already uses to load it (look for the handler in `Sidebar.tsx` that loads `PRODUCT_LISTING_GENERATOR`).
- Strip the param from the URL after applying so a refresh doesn't keep reloading the template.

Map: `?template=product-listing` → `PRODUCT_LISTING_GENERATOR` from `src/lib/prebuiltWorkflows.ts`.

## Acceptance criteria
- [ ] Visiting `/app?template=product-listing` loads the template into the canvas on first paint.
- [ ] Unknown template values are ignored silently and the editor opens empty.
- [ ] URL is cleaned up after applying.
