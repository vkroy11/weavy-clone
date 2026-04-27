---
title: Rotate leaked Gemini API key and remove from repo
severity: critical
category: security
file: .env:13
---

## Problem
A real Google Gemini API key (`GEMINI_API_KEY=AIzaSy...`) is committed to the repo in `.env`. The file is tracked by git, so anyone with access to the repo (including past clones, forks, and GitHub history) can use it.

## Why it matters
The key authorises calls billed to whoever owns the Google Cloud project. It can be scraped from GitHub within minutes of being pushed and used to drain quota or run abuse against the project's billing account. Even after deletion, the value lives in git history.

## Suggested fix
1. **Rotate the key** in Google AI Studio / Cloud Console — the existing one must be assumed compromised.
2. Move the new key into `.env.local` (gitignored by Next.js by default).
3. Add `.env` to `.gitignore` and replace the committed `.env` with `.env.example` containing only placeholder values (`GEMINI_API_KEY=your_key_here`).
4. Scrub the value from git history with `git filter-repo --replace-text` or BFG, then force-push (coordinate with anyone else on the repo).
5. Audit Google Cloud usage logs for unauthorised calls during the exposure window.

## Acceptance criteria
- [ ] New key issued; old key revoked.
- [ ] `.env` is in `.gitignore`; `git ls-files .env` returns nothing.
- [ ] `.env.example` exists with placeholder values only.
- [ ] `git log -p -- .env` shows the secret has been removed from history (or repo history rewritten).
- [ ] App still runs locally with the rotated key in `.env.local`.
