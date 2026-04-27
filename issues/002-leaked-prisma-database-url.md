---
title: Rotate leaked Prisma Postgres URL and remove from repo
severity: critical
category: security
file: .env:12
---

## Problem
`DATABASE_URL` in `.env` contains a Prisma Postgres connection string with embedded credentials/API key. It is committed to the repo.

## Why it matters
Anyone with the URL can connect to the database and read or modify all stored workflows. If the project ever stores user data or PII, this is an unbounded data-exfiltration vector. Like any committed secret, it must be assumed already harvested.

## Suggested fix
1. Rotate the Prisma Postgres connection (regenerate the API key from the Prisma dashboard, or rotate the database password).
2. Move the new URL to `.env.local`.
3. Confirm `prisma/schema.prisma` actually uses Postgres (the project also has `prisma/dev.db` SQLite; if SQLite is the real backend, the Postgres URL was never needed and should be deleted entirely).
4. Same `.gitignore` + history-scrub treatment as #001.

## Acceptance criteria
- [ ] DB credentials rotated.
- [ ] `DATABASE_URL` lives only in `.env.local` or platform secrets, not in `.env`.
- [ ] If SQLite is the real backend, remove `DATABASE_URL` from any committed file.
- [ ] No Postgres connection string visible in `git log -p`.
