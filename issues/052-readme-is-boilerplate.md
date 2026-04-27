---
title: README is the create-next-app template
severity: low
category: quality
file: README.md
---

## Problem
`README.md` is the unmodified `create-next-app` boilerplate. There's no description of what the app does, no setup instructions specific to this project (env vars, Prisma migrate, model providers), and no link to the landing page route.

## Why it matters
First-time contributors land on the README and have to reverse-engineer the project from the tree. Equally, anyone evaluating the repo on GitHub sees "boilerplate" and bounces.

## Suggested fix
Replace with:

1. One-paragraph elevator pitch (lift from the new landing-page hero copy).
2. Screenshot or short GIF of the canvas + a generated output.
3. Quick start: `npm install`, `cp .env.example .env.local`, fill keys, `npx prisma migrate dev`, `npm run dev`.
4. Architecture map: `src/app/` (routes), `src/components/nodes/` (node types), `src/lib/models.ts` (model registry), `src/store/` (Zustand state).
5. Link to `issues/README.md` so the open-issue list is discoverable.

## Acceptance criteria
- [ ] README explains what Weavy is in one paragraph.
- [ ] Includes a working quick-start.
- [ ] Links to the issues index.
