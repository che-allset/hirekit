-- HireKit database schema
-- Run once in Supabase → SQL Editor → New query → paste → Run.

create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────────────────────
-- Companies: one per account. The slug powers the public careers
-- page (/careers/{slug}) and the embeddable widget.
-- ─────────────────────────────────────────────────────────────
create table if not exists public.companies (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid not null unique references auth.users(id) on delete cascade,
  name         text not null,
  slug         text not null unique,
  tagline      text,
  website      text,
  brand_color  text not null default '#4A45E0',
  created_at   timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- Jobs. "requirements" is the list of must-haves the AI screens
-- against, so recruiters control exactly what "a good fit" means.
-- ─────────────────────────────────────────────────────────────
create table if not exists public.jobs (
  id               uuid primary key default gen_random_uuid(),
  company_id       uuid not null references public.companies(id) on delete cascade,
  title            text not null,
  department       text,
  location         text,
  work_mode        text not null default 'Hybrid' check (work_mode in ('On-site','Hybrid','Remote')),
  employment_type  text not null default 'Full-time' check (employment_type in ('Full-time','Part-time','Contract','Internship')),
  salary_range     text,
  description      text not null default '',
  requirements     text not null default '',
  status           text not null default 'open' check (status in ('open','closed')),
  created_at       timestamptz not null default now()
);
create index if not exists jobs_company_idx on public.jobs(company_id);

-- ─────────────────────────────────────────────────────────────
-- Applications + AI assessment. The AI only suggests; humans move
-- candidates through stages (nothing is auto-rejected).
-- ─────────────────────────────────────────────────────────────
create table if not exists public.applications (
  id                   uuid primary key default gen_random_uuid(),
  job_id               uuid not null references public.jobs(id) on delete cascade,
  company_id           uuid not null references public.companies(id) on delete cascade,
  full_name            text not null,
  email                text not null,
  phone                text,
  linkedin_url         text,
  portfolio_url        text,
  cover_letter         text,
  cv_path              text,
  stage                text not null default 'applied'
                         check (stage in ('applied','screening','interview','offer','hired','rejected')),
  ai_status            text not null default 'pending' check (ai_status in ('pending','done','failed')),
  ai_score             int check (ai_score between 0 and 100),
  ai_verdict           text check (ai_verdict in ('strong','possible','weak')),
  ai_summary           text,
  ai_strengths         text[] not null default '{}',
  ai_gaps              text[] not null default '{}',
  ai_questions         text[] not null default '{}',
  notes                text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);
create index if not exists applications_company_idx on public.applications(company_id);
create index if not exists applications_job_idx on public.applications(job_id);

create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists applications_touch on public.applications;
create trigger applications_touch before update on public.applications
  for each row execute function public.touch_updated_at();

-- ─────────────────────────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────────────────────────
alter table public.companies    enable row level security;
alter table public.jobs         enable row level security;
alter table public.applications enable row level security;

-- Companies: public profile is readable by anyone (careers pages);
-- only the owner can change it.
drop policy if exists "companies public read" on public.companies;
create policy "companies public read" on public.companies
  for select using (true);

drop policy if exists "companies owner write" on public.companies;
create policy "companies owner write" on public.companies
  for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- Jobs: open jobs are public; owners see and manage all their jobs.
drop policy if exists "jobs public read open" on public.jobs;
create policy "jobs public read open" on public.jobs
  for select using (status = 'open');

drop policy if exists "jobs owner all" on public.jobs;
create policy "jobs owner all" on public.jobs
  for all
  using (company_id in (select id from public.companies where owner_id = auth.uid()))
  with check (company_id in (select id from public.companies where owner_id = auth.uid()));

-- Applications: private to the owning company. Candidates never
-- write directly; inserts go through the /api/apply endpoint, which
-- validates input and uses the service role.
drop policy if exists "applications owner all" on public.applications;
create policy "applications owner all" on public.applications
  for all
  using (company_id in (select id from public.companies where owner_id = auth.uid()))
  with check (company_id in (select id from public.companies where owner_id = auth.uid()));

-- ─────────────────────────────────────────────────────────────
-- Private storage bucket for CVs (served to recruiters through
-- short-lived signed URLs only).
-- ─────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('cvs', 'cvs', false)
on conflict (id) do nothing;

-- ═════════ Migration 002 (also in supabase/migrations/002_billing_scheduling.sql) ═════════

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
