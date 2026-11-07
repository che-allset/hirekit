# HireKit: plug-and-play recruiting for any company

HireKit is a recruiting toolkit a company can set up in about five minutes. You sign up and post a role, and you get:

1. **A branded careers page** at `/careers/your-company`
2. **A one-line website widget** that shows your open roles and the apply form on your own site
3. **AI screening** that scores every applicant against your must-have requirements, with strengths, gaps and suggested interview questions
4. **A hiring pipeline** (Applied → Screening → Interview → Offer → Hired / Rejected) with filters, notes and CV access
5. **An AI job writer** that turns a few notes into an inclusive job post

It also includes a full **marketing landing page** for the service.

> **Live demo:** `https://hirekit-ashen.vercel.app`
> **Test login:** `demo@hirekit.dev` / `hirekit-demo-2026` (or press “Explore the demo workspace” on the login page)
> **Widget on a third-party site:** `/demo.html`  ·  **Careers page:** `/careers/northwind-labs`

---

## Brand and front end (round 2)

| | |
|---|---|
| **Logo** | A plug whose prongs and crossbar form an H, for plug-and-play hiring (`src/components/Logo.tsx`, `src/app/icon.svg`) |
| **Colour** | Graphite `#23272D`, steel `#E7E9EC`, signal yellow `#FFD12E`, forest `#1D5C47` for positive states |
| **Type** | One self-hosted grotesque family: condensed bold for headlines, regular and bold for text |
| **Photos** | Real full-colour photos (Pexels License) from one photographer's series, with a light shared grade (`public/photos/CREDITS.md`) |
| **Intro film** | 14-second silent loop in the hero (`public/video/intro.mp4`) |
| **Tour / VSL** | 1:26 video sales letter with on-screen text (`public/video/hirekit-tour.mp4`), plus a voiceover script in `docs/vsl-voiceover.md` |
| **Multi-step forms** | 4-step company sign-up (company, hiring needs, brand colour with live preview, account) and a 3-step candidate application |
| **Pricing** | Monthly/yearly toggle, three plans and a full comparison table |

The videos are rendered from code: each scene is an HTML frame drawn at 30 fps and encoded with ffmpeg.

## Two features beyond the brief

**1. Try it on a real application (landing page, `/#try`).** Visitors edit the must-haves, paste a CV or upload a PDF, and get the same AI assessment a recruiter would see, with no sign-up. Nothing is stored. The endpoint (`/api/try`) has input limits and per-visitor rate limiting because it is public. It is the fastest way for a buyer, or a reviewer, to see the product's core value.

**2. Ask your pipeline (dashboard, `/dashboard/ask`).** Recruiters ask questions in plain language, such as "Who should I interview first?" or "Who has customer-facing experience and speaks German?". Claude answers only from the candidates' applications, AI assessments and team notes, and links to each candidate it relied on. It declines to rank or filter by age, gender, nationality or other protected traits, and never guesses them from names. That keeps the feature useful and in line with the EU AI Act.

## How I read the brief

> *“Build a framework for companies who are trying to recruit people… a plug and play tool.”*

I took “framework” to mean **reusable infrastructure any company can drop into its existing setup**, as opposed to a single company's hiring site. “Plug and play” then becomes the main design constraint:

| Requirement | How HireKit answers it |
|---|---|
| Works for *any* company | Multi-tenant: every sign-up gets an isolated workspace, slug, branding and careers page |
| Plug into what they already have | `<script src=".../widget.js" data-company="slug">` works in WordPress, Webflow, Wix or custom HTML. There is an iframe fallback for builders that block scripts |
| No setup burden | Accounts are created pre-confirmed, a company is provisioned on sign-up, and AI drafts job posts |
| Saves recruiters time | Claude screens each application against the employer's *own* requirements and explains its reasoning |

## Product tour

| Page | What it shows |
|---|---|
| `/` | Landing page: hero, how it works, features, embed showcase, AI section, trust and compliance, pricing, FAQ |
| `/signup`, `/login` | Company onboarding |
| `/dashboard` | KPIs, top candidates to review, pipeline funnel, applicants per role, onboarding checklist for new accounts |
| `/dashboard/candidates` | Kanban **board** or ranked **list**, filters by role, AI fit, stage and search, plus inline stage changes |
| `/dashboard/candidates/[id]` | AI assessment (score, summary, strengths, gaps, interview questions), CV via signed URL, cover letter, notes, re-run screening |
| `/dashboard/jobs` | Create, edit, close and reopen roles, with “Draft with AI” |
| `/dashboard/settings` | Careers link, widget code, iframe fallback, branding with live preview |
| `/careers/[slug]` | Public, branded careers page. Job pages include Google for Jobs structured data |
| `/embed/[slug]` | What the widget renders (auto-resizes to its content) |
| `/demo.html` | A fictional company website using the one-line widget |

## Architecture

```
Next.js 14 (App Router, Server Components, Server Actions)
├─ Supabase Postgres  → companies, jobs, applications (Row Level Security)
├─ Supabase Auth      → company accounts
├─ Supabase Storage   → private "cvs" bucket, signed URLs only
├─ Anthropic Claude   → candidate screening (PDF CV read natively) + job post writer
└─ Vercel             → hosting
```

**Apply flow** (`src/app/api/apply/route.ts`):
validate input (honeypot, email, consent, real `%PDF-` signature, 5 MB limit) → check the job is open → block duplicate applications → upload the CV to private storage → save the application → Claude screening → save the assessment.
If the AI call fails, the application is **still saved** (`ai_status = failed`) and the recruiter can re-run screening from the dashboard.

**AI design** (`src/lib/ai.ts`):
- Uses **forced tool use** so Claude always returns structured JSON (score, verdict, summary, strengths, gaps, questions). No brittle text parsing.
- The CV PDF is passed to Claude **as a document**, so no separate PDF parsing library is needed.
- The score is clamped, and the verdict is derived from the score in code, so the label always matches the number.
- The system prompt tells Claude to judge only job-relevant evidence and to ignore name, age, gender, nationality and similar attributes.

## Security and compliance decisions

- **Row Level Security** on every table. Companies can only see their own jobs and applicants, and the public can read only open jobs and company profiles.
- **Candidates never write to the database directly.** Applications go through one validated server endpoint that uses the service role.
- **CVs are private** and only served through 1-hour signed URLs, after an RLS-scoped ownership check.
- **The AI only advises.** Nothing is auto-rejected and every stage change is a human action. This matters under the EU AI Act, which treats AI used in recruitment as *high-risk*.
- **GDPR**: explicit consent on the apply form, which also tells candidates that AI assists the review.
- URLs are sanitised to `http(s)` only, and brand colours are validated as hex.

## Run it yourself

### 1. Supabase
1. Create a project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor → New query**, paste [`supabase/schema.sql`](supabase/schema.sql) and click **Run**. This creates the tables, RLS policies and the private `cvs` bucket.
3. Copy the **Project URL**, **anon key** and **service_role key** from **Project Settings → API**.

### 2. Environment variables
Copy `.env.example` to `.env.local` and fill it in:

| Variable | Where |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API (keep secret) |
| `ANTHROPIC_API_KEY` | console.anthropic.com |
| `ANTHROPIC_MODEL` | optional, defaults to `claude-sonnet-5-5` |
| `SEED_SECRET` | any random string |

### 3. Run
```bash
npm install
npm run dev
```

### 4. Demo data
Open `/api/seed?secret=YOUR_SEED_SECRET` once. This creates the demo account, the fictional company *Northwind Labs*, 5 roles and 12 screened candidates. Run it again at any time to reset the demo.

### 5. Deploy
Import the repo in Vercel, add the same environment variables and deploy. Then open `/api/seed?secret=…` on the live URL.

## Project structure

```
src/
├─ app/
│  ├─ page.tsx                   Landing page
│  ├─ (auth)/                    Login, sign-up, auth actions
│  ├─ careers/[slug]/            Public careers page + job page
│  ├─ embed/[slug]/              Widget (iframe) views
│  ├─ dashboard/                 Company app (overview, candidates, jobs, settings) + server actions
│  └─ api/apply, api/seed        Public apply endpoint, demo seeding
├─ components/careers/           Job list, job detail, apply form, embed resizer
├─ lib/                          Supabase clients, AI, types, helpers, demo data
└─ middleware.ts                 Session refresh + route protection
public/widget.js                 The one-line embed script
public/demo.html                 Third-party site using the widget
supabase/schema.sql              Database, RLS, storage
```

## What I would build next

- Email notifications (new strong match for recruiters, confirmation for candidates) via Resend
- Team members with roles (recruiter, hiring manager) and @mentions in notes
- Interview scheduling with calendar integration
- Custom screening questions per job (knockout questions)
- Job board syndication (LinkedIn, Indeed, StepStone)
- Rate limiting on `/api/apply` (e.g. Upstash) and Stripe billing for the pricing plans
- GDPR tooling: automatic data retention and deletion, candidate data export
