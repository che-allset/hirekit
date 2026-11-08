-- HireKit migration 003: remember each company's dashboard language,
-- so notification emails to the recruiter arrive in their language.
-- Run once in Supabase → SQL Editor → New query → paste → Run. Safe to run twice.

alter table public.companies
  add column if not exists locale text not null default 'en'
  check (locale in ('en','de','es','fr'));
