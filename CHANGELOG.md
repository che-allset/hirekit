# Changelog

Newest first. Every session (Chee's Claude or the company's Claude Code) adds an entry when it pushes: date, who, what changed and why.

## Suggestions for Chee's session
_(The polish session lists bigger ideas here instead of building them.)_

## 2026-11-08 · Company Claude Code (polish)
- **English-only messages now in all four languages.** The landing page "Try it" errors (`tryIt.errors.*`), sign-up errors (`auth.signup.errors.exists`, `companyFailed`; the rest reuse existing keys), dashboard errors from the job form, AI writer, re-screening, settings and Ask your pipeline (`dash.errors.*`), the "Page not found" page (`notFound.*`), the requirements example in the job form (`jobs.form.requirementsPh`) and "30 min" in interview booking (`schedule.minutes`). Raw technical database messages are no longer shown to users; they see a clear "wasn't saved" message instead. Only the wording of messages changed, not how sign-up works. Why: German, Spanish and French users were seeing English at key moments.
- **Loading placeholders and a friendly error page.** Grey placeholders in the shape of the page now show while the dashboard, careers page and website widget load (the careers page and widget can take a few seconds the first time they're translated). When a page fails, visitors see a branded "Something went wrong" page with "Try again" and a way back, in their language, instead of Next.js's plain English crash screen; in the dashboard the menu stays visible. New files: `src/app/error.tsx`, `src/app/dashboard/error.tsx`, `src/app/dashboard/loading.tsx`, `src/app/careers/[slug]/loading.tsx`, `src/app/embed/[slug]/loading.tsx`, `src/components/ErrorView.tsx`, `src/components/careers/JobListSkeleton.tsx`. New keys `loading` and `errorPage.*` in EN/DE/ES/FR. Why: blank screens looked broken.
- **No more spinners that never stop.** If the connection drops or the server fails mid-request, these now stop loading and show a short message in the user's language instead of hanging: Ask your pipeline, Settings save, job save and "Draft with AI", notes save, re-run screening, plan/checkout buttons, interview booking, the free-slot lookup ("Checking your calendar…"), sign-up, and the new forgot-password and reset-password forms. New messages in EN/DE/ES/FR (`dash.errors.generic`, `dash.settings.failed`, `dash.ask.failed`, `auth.forgot.failed`, `auth.signup.errors.failed`). Why: a dropped connection used to freeze these screens until a page reload.
- **No more silent save failures in the dashboard.** If moving a candidate to another stage fails, the dropdown goes back to the real stage and says the change wasn't saved (it used to show the new stage anyway). Opening/closing a job and deleting a job now report database errors instead of pretending they worked; the delete button greys out while it runs. Cancelling an interview now asks "Are you sure?" first, can't be double-tapped and shows an error if it fails. New messages in EN/DE/ES/FR (`dash.errors.saveFailed`, `dash.schedule.confirmCancel`, `cancelling`, `errors.cancel`). Why: recruiters could believe a change was saved when it wasn't.

## 2026-11-08 · Chee's Claude: emails
- Transactional emails over Resend, built up to the key: candidate confirmation (candidate's language, company colour), recruiter alert with AI score (recruiter's dashboard language), password reset (forgot / reset pages, one-time link, demo account protected).
- Migration `003_email_language.sql`: `companies.locale` remembers the dashboard language. Needs to be run in Supabase.
- New env vars: `RESEND_API_KEY`, `EMAIL_FROM`.

## 2026-11-08 · Chee's Claude
- Added polish-only rules to `CLAUDE.md`: the company's Claude Code improves what exists and never changes features, brand, copy meaning, pricing, database, billing or integrations without explicit approval.
- Added `CLAUDE.md` (project rules and how the two Claude sessions share this repo) and this changelog.

## 2026-11-08 · Chee's Claude: round 3
- Interview booking: connect Google (Calendar + Meet), Microsoft (Outlook + Teams) and Zoom; free-slot suggestions; invite from the candidate page or from Ask your pipeline; `.ics` + email fallback without a calendar.
- Stripe billing built up to the env vars: checkout, customer portal, signature-verified webhook, auto-created prices.
- New pricing after competitor research: 7-day trial with 1 role, then Starter €49, Growth €99, Scale €199 (20% off yearly). Limits enforced.
- Migration `002_billing_scheduling.sql` (run in Supabase on 2026-11-08).

## 2026-11-07/08 · Chee's Claude: round 2 polish
- Job posts auto-translate into the visitor's language (cached 30 days).
- New title font (Inter Display), full-width header; intro and tour videos re-rendered in EN/DE/ES/FR.

## Earlier
- Round 1: careers page, widget, AI screening, pipeline, dashboard.
- Round 2: brand, landing page, videos, multi-step forms, pricing, photos, four languages, Try it, Ask your pipeline.
