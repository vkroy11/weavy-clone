# Deploying Weavy to Vercel

Target domain: **`weavy-clone.vishalkumarroy.xyz`**

This document is the end-to-end runbook. Follow it top-to-bottom on a fresh Vercel project.

---

## 0. Pre-flight

The repo is already prepared for deploy. Code-side changes that have been made for you:

| Change | File | Why |
|---|---|---|
| Prisma schema switched to **PostgreSQL** | `prisma/schema.prisma` | SQLite needs a persistent filesystem; Vercel serverless has none. |
| `prisma generate` runs on install + build | `package.json` (`postinstall`, `build`) | Ensures the Prisma Client is regenerated against the deployed schema. |
| `maxDuration = 60` on the run route | `src/app/api/workflow/run/route.ts` | Gemini image gen takes 12–25s; default 10s would 504. |
| `next.config.ts` cleaned up | `next.config.ts` | Next 16 dropped lint-during-build, so issue 020's `as any` errors no longer block deploys. |
| Postgres-friendly `Json` cast | `src/app/api/workflow/save/route.ts` | Prisma's Postgres typing for `Json` is stricter than SQLite's was. |
| `prisma/dev.db` ignored | `.gitignore` | Stops the local SQLite scratch DB from sneaking into git. |

Verify the production build still passes locally before deploying:

```bash
npm run build
```

You should see all routes register (`/`, `/app`, `/api/workflow/*`, `/icon.svg`, `/apple-icon`, `/opengraph-image`, `/twitter-image`, `/manifest.webmanifest`).

---

## 1. Database

You need a Postgres database that is reachable from Vercel's serverless functions.

### Option A — keep using your existing Prisma Postgres

You already have a `DATABASE_URL` in `.env` pointing at a Prisma Postgres instance. **Issue [002](issues/002-leaked-prisma-database-url.md) flagged that this URL was committed to git**, so before reusing it:

1. Open the [Prisma Data Platform](https://console.prisma.io/) → your project → **Connection strings**.
2. **Rotate** the API key on the existing connection string (or generate a new one and revoke the old).
3. Save the new URL — you'll paste it into Vercel in step 3.

### Option B — Vercel Postgres (Neon-backed)

1. Vercel dashboard → your project → **Storage** → **Create Database** → **Postgres**.
2. Pick a region close to your users (e.g. `iad1` for North-America-East).
3. Vercel auto-injects `DATABASE_URL` into the project's environment. You don't need to copy/paste it.

Either way, after the project is wired up you'll run a one-time push from your laptop to apply the schema:

```bash
# .env.local at the repo root needs both env vars (copy from Vercel's
# Storage → your-database → ".env.local" tab):
#   PRISMA_DATABASE_URL="prisma+postgres://..."
#   POSTGRES_URL="postgres://..."
# Then:
npx prisma db push
```

This creates the `Workflow` table (with `clientId`, `nodes`, `edges`, indexes) on the new database.

> **Heads up:** any saved workflows that lived in the local `prisma/dev.db` SQLite file do **not** carry over. They were dev test data anyway. After deploy, the editor's auto-save will populate the new Postgres `Workflow` table cleanly.

---

## 2. Push the repo

If the project isn't on GitHub yet:

```bash
git remote -v        # sanity-check
git push origin main
```

Then on Vercel:

1. Dashboard → **Add New** → **Project** → **Import Git Repository**.
2. Pick `vkroy11/weavy-clone`.
3. **Framework preset**: Next.js (auto-detected).
4. **Root directory**: leave at repo root.
5. **Build command**: leave default (`npm run build` — already wired through `prisma generate && next build`).
6. **Install command**: leave default. The `postinstall` hook regenerates Prisma Client.
7. Don't deploy yet — click **Configure Project** and head to step 3 first.

---

## 3. Environment variables

In the Vercel project, **Settings → Environment Variables**, add the following three for **Production**, **Preview**, and **Development** (unless noted):

| Name | Value | Scope | Notes |
|---|---|---|---|
| `PRISMA_DATABASE_URL` | your pooled Postgres URL (`prisma+postgres://…`) | All envs | Auto-injected when you connect a Vercel Postgres DB to the project. Used at runtime by the Prisma Client. |
| `POSTGRES_URL` | your direct Postgres URL (`postgres://…`) | All envs | Auto-injected. Used by `prisma db push` / migrations as `directUrl`. |
| `NEXT_PUBLIC_SITE_URL` | `https://weavy-clone.vishalkumarroy.xyz` | Production only | Needed so OG / Twitter image URLs resolve to absolute https URLs that Facebook/X/Slack/Discord can fetch. For Preview, leave unset — the layout falls back to `https://${VERCEL_URL}`. |
| *(do not set)* `DATABASE_URL` | — | — | The schema reads `PRISMA_DATABASE_URL` and `POSTGRES_URL` directly. A `DATABASE_URL` var would be ignored. |
| *(do not set)* `GEMINI_API_KEY` | — | — | The product is BYOK (issue 003 — keys live in the user's browser). The server explicitly does not read env keys. Setting this would be dead config. |
| *(do not set)* `OPENAI_API_KEY` | — | — | Same as above. |

### Sanity check

Once saved, the **Environment Variables** page should show exactly two custom vars (`DATABASE_URL`, `NEXT_PUBLIC_SITE_URL`) plus whatever Vercel auto-injects (`VERCEL_URL`, etc.).

---

## 4. First deploy

Hit **Deploy**. The first build takes ~2 minutes:

1. `npm install` runs → triggers `postinstall` → `prisma generate` produces the Client against your new schema.
2. `npm run build` runs → `prisma generate` again (no-op cached) → `next build`.
3. Static pages (`/`, `/app`, the dynamic icons, manifest) prerender.
4. Functions deploy (`/api/workflow/save`, `load`, `run`, `delete`).

When the deploy finishes you'll get a default URL like `weavy-clone-vkroy11.vercel.app`. Open it and verify:

- `/` loads the landing page with the live demo animation.
- `/app` loads, the **first-run gate** asks you for an API key (BYOK), the **session picker** appears once you have keys.
- `/api/workflow/load?clientId=test` returns `[]` (200) — confirms the DB is reachable.

If `/api/workflow/load?clientId=test` 500s, the schema hasn't been pushed yet — see step 1.

---

## 5. Custom domain

This is the `weavy-clone.vishalkumarroy.xyz` step.

### 5a. Add the domain in Vercel

1. Project → **Settings → Domains** → **Add**.
2. Type `weavy-clone.vishalkumarroy.xyz` and submit.
3. Vercel will show one of two DNS records you need at your registrar:
   - **CNAME** record: `weavy-clone` → `cname.vercel-dns.com` *(this is the recommended one for a subdomain)*
   - Or, if the registrar doesn't support CNAME at apex: an A record. (Not relevant here since you're on a subdomain.)

### 5b. Add the DNS record

You said `vishalkumarroy.xyz` is the parent domain, so this is a subdomain — CNAME is right.

At your DNS provider (wherever `vishalkumarroy.xyz` is hosted — Cloudflare, Namecheap, GoDaddy, etc.):

| Record | Name (host) | Value (target) | TTL | Proxy |
|---|---|---|---|---|
| `CNAME` | `weavy-clone` | `cname.vercel-dns.com` | `Auto` (or 3600) | **DNS only** if Cloudflare — *not* proxied. Vercel handles SSL itself; turning on Cloudflare proxy breaks the cert handshake. |

Save. Propagation usually completes within a minute, but DNS can take up to an hour.

### 5c. Verify

Back in Vercel, on the **Domains** page, the status pill goes from **Pending** → **Verifying** → **Valid Configuration**.

Once it's green:

- Vercel auto-issues a Let's Encrypt cert. Wait ~30s for the cert pill to also go green.
- `https://weavy-clone.vishalkumarroy.xyz` should now serve the landing page.

### 5d. Set as primary

In **Domains**, click the `…` menu next to `weavy-clone.vishalkumarroy.xyz` → **Set as primary**. This makes the default `*.vercel.app` URL redirect to your custom domain.

### 5e. Update `NEXT_PUBLIC_SITE_URL` and redeploy

If you set `NEXT_PUBLIC_SITE_URL` *before* the domain was live, the OG image URLs are already correct. If you didn't, set it now and redeploy:

```
NEXT_PUBLIC_SITE_URL = https://weavy-clone.vishalkumarroy.xyz
```

Redeploy from **Deployments** → click the latest deploy → **Redeploy**.

---

## 6. Smoke test the live site

Visit `https://weavy-clone.vishalkumarroy.xyz/` and check each:

1. **Landing**: hero animation runs, the actual posters render, the Sessions/Features/Use-cases sections fill in. No 404s in DevTools → Network.
2. **Favicon + OG**: hard-refresh with DevTools open. Confirm `<link rel="icon" href=".../icon.svg">`, `<link rel="apple-touch-icon" href=".../apple-icon">`, `<meta property="og:image" content="https://weavy-clone.vishalkumarroy.xyz/opengraph-image?…">`.
3. **OG preview**: paste the live URL into [opengraph.dev](https://www.opengraph.dev/) (or share it in a Slack/Discord channel) — the dark-gradient card with the W mark, headline, and model chips should render at 1200×630.
4. **App**: `/app` → the FirstRunGate appears. Save a Gemini key (you'll need a real one from `aistudio.google.com/app/apikey`). The SessionPicker shows (empty list) → click **Start a new workflow**.
5. **First save**: drag a Text + LLM node, type a prompt, click the LLM node's **Run this node**. Watch the toolbar pill flip `Editing… → Saving… → Saved Xs ago`. Then refresh the page → SessionPicker shows the workflow → Resume → exact same canvas reappears.
6. **DB sanity**: in the Vercel dashboard → your Postgres → **Browse data** → `Workflow` table should show 1 row tagged with your browser's `clientId`.

---

## 7. Post-deploy follow-ups

These are tracked in `issues/` and become more pressing once real users land:

- **Issue 030** — image base64 inside workflow JSON. Auto-save POSTs every 1.5s during edits; with image-heavy chains the request body can hit Vercel's 4 MB limit. Move bytes to an `Asset` table.
- **Issue 004** — workflow APIs are still unauthenticated and scoped only by browser-supplied `clientId`. Fine for a personal demo; needs real auth before this is widely shared.
- **Issue 001 / 002** — rotate the leaked Gemini key and the previously-committed Prisma URL. The runtime no longer reads either, but the secrets sit in git history.
- **Issue 020 / 021 / 014** — typed cleanup. Won't break anything, will make future SDK upgrades safer.

---

## 8. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Build fails on `prisma generate` step | DB env vars missing | Step 3. `prisma generate` doesn't *connect* but it parses the schema. |
| `500` with `Environment variable not found: DATABASE_URL` | Schema is reading the wrong env var name | Already fixed in `prisma/schema.prisma` — it now reads `PRISMA_DATABASE_URL` and `POSTGRES_URL`, which are the names Vercel's integration creates. Pull the latest commit and redeploy. |
| `500` on every `/api/workflow/*` call | Schema not pushed to Postgres | Run `npx prisma db push` from your laptop with `PRISMA_DATABASE_URL` and `POSTGRES_URL` in `.env.local`. |
| Landing loads but `/app` blanks | Browser still has localStorage from a stale build | Open DevTools → Application → Storage → Clear site data → reload. |
| Run node 504s on Gemini calls | `maxDuration = 60` not picked up | Check `src/app/api/workflow/run/route.ts:8` — it must be `export const maxDuration = 60`. Then redeploy. |
| OG card shows the wrong URL on Slack | `NEXT_PUBLIC_SITE_URL` still points at a preview URL | Set it to `https://weavy-clone.vishalkumarroy.xyz` and redeploy. |
| Custom domain stuck on "Pending" | DNS not propagated, or Cloudflare proxy is on | Check `dig weavy-clone.vishalkumarroy.xyz` returns `cname.vercel-dns.com`. If using Cloudflare, set the CNAME to **DNS only** (grey cloud). |
| `Failed to compile` because `eslint` config | Pre-existing issue 020 errors | The current `next.config.ts` already handles this — `next build` no longer runs lint by default in v16. If you re-add `eslint:` keys to the config, TypeScript will reject them. |
