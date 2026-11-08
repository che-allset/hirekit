-- HireKit migration 002: billing (Stripe), calendar/video integrations, interviews.
-- Run once in Supabase → SQL Editor → New query → paste → Run. Safe to run twice.

-- ─────────────────────────────────────────────────────────────
-- Billing: one row per company. Created automatically with a 7-day
-- trial. Only the server (service role / Stripe webhook) writes here.
-- Kept out of "companies" because company rows are publicly readable.
-- ─────────────────────────────────────────────────────────────
create table if not exists public.billing (
  company_id             uuid primary key references public.companies(id) on delete cascade,
  plan                   text not null default 'trial' check (plan in ('trial','starter','growth','scale')),
  billing_interval       text check (billing_interval in ('month','year')),
  status                 text not null default 'trialing',
  trial_ends_at          timestamptz not null default now() + interval '7 days',
  current_period_end     timestamptz,
  cancel_at_period_end   boolean not null default false,
  stripe_customer_id     text unique,
  stripe_subscription_id text unique,
  updated_at             timestamptz not null default now()
);
alter table public.billing enable row level security;
drop policy if exists "billing owner read" on public.billing;
create policy "billing owner read" on public.billing
  for select using (company_id in (select id from public.companies where owner_id = auth.uid()));

-- ─────────────────────────────────────────────────────────────
-- Integrations: Google (Calendar + Meet), Microsoft (Outlook + Teams),
-- Zoom. Tokens are encrypted by the app. RLS is on with no policies,
-- so only the server can read them; they never reach the browser.
-- ─────────────────────────────────────────────────────────────
create table if not exists public.integrations (
  id             uuid primary key default gen_random_uuid(),
  company_id     uuid not null references public.companies(id) on delete cascade,
  provider       text not null check (provider in ('google','microsoft','zoom')),
  account_email  text,
  access_token   text not null,
  refresh_token  text,
  expires_at     timestamptz,
  created_at     timestamptz not null default now(),
  unique (company_id, provider)
);
alter table public.integrations enable row level security;

-- ─────────────────────────────────────────────────────────────
-- Interviews booked from HireKit.
-- ─────────────────────────────────────────────────────────────
create table if not exists public.interviews (
  id                 uuid primary key default gen_random_uuid(),
  company_id         uuid not null references public.companies(id) on delete cascade,
  application_id     uuid not null references public.applications(id) on delete cascade,
  meeting_type       text not null check (meeting_type in ('google_meet','teams','zoom','custom')),
  calendar           text check (calendar in ('google','microsoft')),
  starts_at          timestamptz not null,
  duration_min       int not null check (duration_min between 10 and 240),
  join_url           text,
  calendar_event_id  text,
  zoom_meeting_id    text,
  status             text not null default 'scheduled' check (status in ('scheduled','cancelled')),
  created_at         timestamptz not null default now()
);
create index if not exists interviews_application_idx on public.interviews(application_id);
alter table public.interviews enable row level security;
drop policy if exists "interviews owner all" on public.interviews;
create policy "interviews owner all" on public.interviews
  for all
  using (company_id in (select id from public.companies where owner_id = auth.uid()))
  with check (company_id in (select id from public.companies where owner_id = auth.uid()));
