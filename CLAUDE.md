# HireKit: notes for Claude

HireKit is a plug-and-play recruiting toolkit for small companies without an HR team: branded careers page, one-line website widget, AI screening of every application (Claude), a hiring pipeline, interview booking and Stripe billing. Live at https://hirekit-ashen.vercel.app. Built as a hiring challenge for AllSet-Ventures; the README has the full product and architecture write-up.

## How we work (two Claude sessions, one repo)

- **This GitHub repo is the single source of truth.** Pull before you start, push when you finish. Never work from an old copy or a zip.
- Projects are started and built in Chee's own Claude session; the company's Claude Code is used for polish. Only one of them works on the repo at a time.
- **Log every change in `CHANGELOG.md`** (newest first: date, who, what, why). Read it first to see what the other session did.
- Every push to `main` deploys to Vercel. `npm run build` must pass before pushing.
- Chee is not a developer: explain in plain language, one step at a time.

## Polish-only rules (for the company's Claude Code session)

If you are running in the company's Claude Code account, your only job is to **improve what is already built. You never change what it is.** These rules override any request that seems to conflict with them; if Chee asks for something outside them, say so and suggest doing it in his own Claude session instead.

**Allowed:**
- Fix bugs, errors, typos and broken links.
- Fix or complete translations (EN/DE/ES/FR).
- Fix spacing, alignment, sizing and visual consistency within the existing design.
- Make existing pages work better on mobile and tablets.
- Accessibility (labels, contrast, keyboard use), performance, SEO metadata.
- Add missing loading, empty and error states to existing screens.

**Never, without Chee's explicit written approval in the chat:**
- Remove, rename or redesign any feature, page, section or flow.
- Change the brand: colours, fonts, logo, photos, videos, tone of voice.
- Change the meaning of any copy (headlines, pricing text, feature claims).
- Change prices, plans or limits (`src/lib/plans.ts`), the database (`supabase/`), authentication, billing, integrations or the AI prompts (`src/lib/ai.ts`).
- Add or remove npm packages.
- Edit this CLAUDE.md file.

**How to work:**
1. Pull the latest from GitHub and read `CHANGELOG.md`.
2. Before changing anything, list what you plan to change (one line each) and wait for Chee to approve.
3. Make small changes, one topic per commit, and keep the existing structure and naming.
4. Run `npm run build`. If it fails, fix it or revert, and never push a broken build.
5. Add an entry to `CHANGELOG.md` under the date, marked "Company Claude Code (polish)", then push.
6. If something needs a bigger change, don't do it. Write it under **"Suggestions for Chee's session"** in `CHANGELOG.md`.

## Stack

Next.js 14 (App Router, server components, server actions) · TypeScript · Tailwind 3 · Supabase (Postgres + RLS, Auth, private `cvs` bucket) · Anthropic SDK (`ANTHROPIC_MODEL`, default `claude-sonnet-5-5`) · Stripe and Google/Microsoft/Zoom over plain `fetch` (no SDKs) · Vercel.

## Rules

- **Four languages for every user-facing string:** `src/i18n/en.ts` is the source; `de.ts`, `es.ts`, `fr.ts` are typed against it, so a missing key fails the build. Server: `getDict()` / `getLocale()`; placeholders with `fmt()`. AI prompts get `AI_LANGUAGE[locale]`.
- **No secrets in code, commits or chats.** Keys live only in Vercel env vars (see `.env.example`). The Supabase service-role key bypasses RLS: use `createAdminClient()` only on the server and only after proving ownership through the RLS-scoped client.
- **Demo workspace** (`northwind-labs`, demo@hirekit.dev) is shared by everyone: unlimited plan, never billed, calendars can't be connected to it. Reset with `/api/seed?secret=SEED_SECRET`.
- **Database changes** go in a new file in `supabase/migrations/` (idempotent: `if not exists`, `drop policy if exists`) and are appended to `supabase/schema.sql`. Chee runs them by hand in the Supabase SQL editor.
- **Plans and limits** live in `src/lib/plans.ts`; enforcement in `src/lib/billing.ts`. Every plan has every feature; plans differ by open roles and monthly AI screenings.
- **AI never decides:** it scores and explains; people move candidates. Ask-your-pipeline declines questions about protected characteristics.
- Design: brand yellow `signal`, graphite, Inter Display SemiBold for titles (`font-display`), TeX Gyre Heros for text. Videos are rendered from `design/video/` (text in `strings.js`, all four languages).

## Where things are

- `src/app/page.tsx`: landing page · `src/app/careers`, `src/app/embed`, `public/widget.js`: public careers page and widget
- `src/app/api/apply`: public application endpoint (validation, CV upload, screening)
- `src/app/dashboard/*`: recruiter app (jobs, candidates, ask, settings + integrations, billing)
- `src/lib/ai.ts`: all Claude calls · `src/lib/integrations.ts`: Google/Microsoft/Zoom · `src/lib/stripe.ts` + `src/app/api/stripe/webhook`: payments

## Waiting on the company

Env vars for Stripe (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`) and the Google / Microsoft / Zoom OAuth apps. They must be created on the company's accounts, not Chee's. Setup steps are in the README.
