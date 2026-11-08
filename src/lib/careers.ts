import 'server-only';
import { createClient } from './supabase/server';
import type { Company, Job } from './types';
import { getBilling } from './billing';

/** Public data for a careers page. RLS only exposes open jobs. */
export async function getCareers(slug: string) {
  const supabase = createClient();
  const { data: company } = await supabase.from('companies').select('*').eq('slug', slug).maybeSingle();
  if (!company) return null;
  // Trial or subscription ended: the careers page stays up but lists no roles.
  if (!(await getBilling(company)).active) return { company: company as Company, jobs: [] as Job[] };
  const { data: jobs } = await supabase
    .from('jobs')
    .select('*')
    .eq('company_id', company.id)
    .eq('status', 'open')
    .order('created_at', { ascending: false });
  return { company: company as Company, jobs: (jobs ?? []) as Job[] };
}

export async function getPublicJob(slug: string, jobId: string) {
  const supabase = createClient();
  const { data: company } = await supabase.from('companies').select('*').eq('slug', slug).maybeSingle();
  if (!company) return null;
  if (!/^[0-9a-f-]{36}$/i.test(jobId)) return null;
  if (!(await getBilling(company)).active) return null;
  const { data: job } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', jobId)
    .eq('company_id', company.id)
    .eq('status', 'open')
    .maybeSingle();
  if (!job) return null;
  return { company: company as Company, job: job as Job };
}
