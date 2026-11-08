'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireCompany } from '@/lib/company';
import { createAdminClient } from '@/lib/supabase/admin';
import { askPipeline, draftJobPost, screenCandidate, type PipelineAnswer } from '@/lib/ai';
import { EMPLOYMENT_TYPES, STAGES, WORK_MODES, type Job, type Stage } from '@/lib/types';
import { isHexColor, safeUrl } from '@/lib/utils';
import { AI_LANGUAGE, isLocale } from '@/i18n';
import { getLocale } from '@/i18n/server';
import { DICTS, fmt } from '@/i18n';
import { canScreen, countOpenRoles, getBilling } from '@/lib/billing';

type Result = { error?: string; ok?: boolean };

// ───────────────────────── Jobs ─────────────────────────

export interface JobInput {
  title: string;
  department: string;
  location: string;
  work_mode: string;
  employment_type: string;
  salary_range: string;
  description: string;
  requirements: string;
  status: 'open' | 'closed';
}

function cleanJob(input: JobInput) {
  const s = (v: string, max: number) => (v ?? '').toString().trim().slice(0, max);
  return {
    title: s(input.title, 120),
    department: s(input.department, 80) || null,
    location: s(input.location, 80) || null,
    work_mode: (WORK_MODES as readonly string[]).includes(input.work_mode) ? input.work_mode : 'Hybrid',
    employment_type: (EMPLOYMENT_TYPES as readonly string[]).includes(input.employment_type)
      ? input.employment_type
      : 'Full-time',
    salary_range: s(input.salary_range, 60) || null,
    description: s(input.description, 8000),
    requirements: s(input.requirements, 3000),
    status: input.status === 'closed' ? ('closed' as const) : ('open' as const),
  };
}

/** Plan check before a role goes (or stays) live. Returns an error message or null. */
async function openRoleBlocked(company: { id: string; slug: string }, exceptJobId: string | null) {
  const t = DICTS[getLocale()].dash.billing;
  const billing = await getBilling(company);
  if (!billing.active) return t.inactiveAction;
  if (!Number.isFinite(billing.limits.roles)) return null;
  const open = await countOpenRoles(company.id, exceptJobId);
  return open >= billing.limits.roles ? fmt(t.roleLimit, { n: billing.limits.roles }) : null;
}

export async function saveJob(jobId: string | null, input: JobInput): Promise<Result> {
  const { supabase, company } = await requireCompany();
  const job = cleanJob(input);
  if (job.title.length < 2) return { error: 'Give the role a title.' };
  if (job.description.length < 20) return { error: 'Add a short description (or use “Draft with AI”).' };
  if (job.status === 'open') {
    const blocked = await openRoleBlocked(company, jobId);
    if (blocked) return { error: blocked };
  }

  if (jobId) {
    const { error } = await supabase.from('jobs').update(job).eq('id', jobId).eq('company_id', company.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from('jobs').insert({ ...job, company_id: company.id });
    if (error) return { error: error.message };
  }
  revalidatePath('/dashboard', 'layout');
  redirect('/dashboard/jobs');
}

export async function setJobStatus(jobId: string, status: 'open' | 'closed'): Promise<Result> {
  const { supabase, company } = await requireCompany();
  if (status === 'open') {
    const blocked = await openRoleBlocked(company, jobId);
    if (blocked) return { error: blocked };
  }
  const { error } = await supabase.from('jobs').update({ status }).eq('id', jobId).eq('company_id', company.id);
  if (error) return { error: DICTS[getLocale()].dash.errors.saveFailed };
  revalidatePath('/dashboard', 'layout');
  return { ok: true };
}

/** The client navigates back to the jobs list on success, so a failed delete can be shown. */
export async function deleteJob(jobId: string): Promise<Result> {
  const { supabase, company } = await requireCompany();
  const { error } = await supabase.from('jobs').delete().eq('id', jobId).eq('company_id', company.id);
  if (error) return { error: DICTS[getLocale()].dash.errors.saveFailed };
  revalidatePath('/dashboard', 'layout');
  return { ok: true };
}

export async function generateJobDraft(input: {
  title: string;
  location: string;
  workMode: string;
  notes: string;
  locale?: string;
}): Promise<{ error?: string; description?: string; requirements?: string }> {
  const { company } = await requireCompany();
  if (input.title.trim().length < 2) return { error: 'Add a job title first.' };
  try {
    const draft = await draftJobPost({
      companyName: company.name,
      title: input.title.slice(0, 120),
      location: input.location.slice(0, 80),
      workMode: input.workMode,
      notes: input.notes.slice(0, 1500),
      language: AI_LANGUAGE[isLocale(input.locale) ? input.locale : getLocale()],
    });
    return draft;
  } catch (err) {
    console.error('Job draft failed', err);
    return { error: 'The AI writer is unavailable right now. Please try again.' };
  }
}

// ───────────────────────── Candidates ─────────────────────────

export async function setStage(applicationId: string, stage: Stage): Promise<Result> {
  if (!STAGES.some((s) => s.key === stage)) return { error: 'Unknown stage' };
  const { supabase, company } = await requireCompany();
  const { error } = await supabase
    .from('applications')
    .update({ stage })
    .eq('id', applicationId)
    .eq('company_id', company.id);
  if (error) return { error: DICTS[getLocale()].dash.errors.saveFailed };
  revalidatePath('/dashboard', 'layout');
  return { ok: true };
}

export async function saveNotes(applicationId: string, notes: string): Promise<Result> {
  const { supabase, company } = await requireCompany();
  const { error } = await supabase
    .from('applications')
    .update({ notes: notes.slice(0, 5000) })
    .eq('id', applicationId)
    .eq('company_id', company.id);
  if (error) return { error: error.message };
  revalidatePath(`/dashboard/candidates/${applicationId}`);
  return { ok: true };
}

export async function rescreen(applicationId: string): Promise<Result> {
  const { supabase, company } = await requireCompany();

  // Read through RLS first: proves this application belongs to the signed-in company.
  const { data: app } = await supabase
    .from('applications')
    .select('*, jobs(*)')
    .eq('id', applicationId)
    .eq('company_id', company.id)
    .maybeSingle();
  if (!app || !app.jobs) return { error: 'Application not found' };
  if (app.ai_status !== 'done' && !(await canScreen(company))) {
    return { error: DICTS[getLocale()].dash.billing.screenLimit };
  }

  const admin = createAdminClient();
  let cvPdfBase64: string | null = null;
  if (app.cv_path) {
    const { data: file } = await admin.storage.from('cvs').download(app.cv_path);
    if (file) cvPdfBase64 = Buffer.from(await file.arrayBuffer()).toString('base64');
  }

  try {
    const result = await screenCandidate(app.jobs as Job, {
      fullName: app.full_name,
      linkedinUrl: app.linkedin_url,
      portfolioUrl: app.portfolio_url,
      coverLetter: app.cover_letter,
      cvPdfBase64,
      language: AI_LANGUAGE[getLocale()],
    });
    await admin
      .from('applications')
      .update({
        ai_status: 'done',
        ai_score: result.score,
        ai_verdict: result.verdict,
        ai_summary: result.summary,
        ai_strengths: result.strengths,
        ai_gaps: result.gaps,
        ai_questions: result.questions,
      })
      .eq('id', applicationId);
  } catch (err) {
    console.error('Re-screen failed', err);
    await admin.from('applications').update({ ai_status: 'failed' }).eq('id', applicationId);
    return { error: 'AI screening failed. Check the Anthropic API key and try again.' };
  }

  revalidatePath('/dashboard', 'layout');
  return { ok: true };
}

// ───────────────────────── Settings ─────────────────────────

export async function saveSettings(input: {
  name: string;
  tagline: string;
  website: string;
  brand_color: string;
}): Promise<Result> {
  const { supabase, company } = await requireCompany();
  const name = input.name.trim().slice(0, 80);
  if (name.length < 2) return { error: 'Company name is too short.' };
  const brand = isHexColor(input.brand_color) ? input.brand_color : company.brand_color;
  const { error } = await supabase
    .from('companies')
    .update({
      name,
      tagline: input.tagline.trim().slice(0, 160) || null,
      website: safeUrl(input.website),
      brand_color: brand,
    })
    .eq('id', company.id);
  if (error) return { error: error.message };
  revalidatePath('/', 'layout');
  return { ok: true };
}

// ───────────────────────── Ask your pipeline ─────────────────────────

export async function askAboutCandidates(
  question: string,
  jobId: string | null,
): Promise<{ error?: string; result?: PipelineAnswer & { names: Record<string, string> } }> {
  const q = question.trim().slice(0, 500);
  if (q.length < 4) return { error: 'Type a question about your candidates.' };

  const { supabase, company } = await requireCompany();
  let query = supabase
    .from('applications')
    .select('id, full_name, stage, ai_score, ai_summary, ai_strengths, ai_gaps, cover_letter, notes, jobs(title)')
    .eq('company_id', company.id)
    .order('ai_score', { ascending: false, nullsFirst: false })
    .limit(60);
  if (jobId) query = query.eq('job_id', jobId);
  const { data, error } = await query;
  if (error) return { error: error.message };
  if (!data || data.length === 0) return { error: 'There are no candidates to ask about yet.' };

  const locale = getLocale();
  const stageNames = DICTS[locale].dash.stages as Record<string, string>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const people = (data as any[]).map((a) => ({
    id: a.id as string,
    name: a.full_name as string,
    role: (a.jobs?.title as string) ?? 'Role',
    stage: stageNames[a.stage as string] ?? (a.stage as string),
    score: (a.ai_score as number | null) ?? null,
    summary: (a.ai_summary as string | null) ?? null,
    strengths: (a.ai_strengths as string[]) ?? [],
    gaps: (a.ai_gaps as string[]) ?? [],
    coverLetter: (a.cover_letter as string | null) ?? null,
    notes: (a.notes as string | null) ?? null,
  }));

  try {
    const answer = await askPipeline(q, people, AI_LANGUAGE[locale]);
    const names: Record<string, string> = {};
    for (const p of people) names[p.id] = p.name;
    return { result: { ...answer, names } };
  } catch (err) {
    console.error('Ask pipeline failed', err);
    return { error: 'The assistant is unavailable right now. Try again in a moment.' };
  }
}

// ───────────────────────── Integrations ─────────────────────────

export async function disconnectIntegration(provider: string) {
  const { company } = await requireCompany();
  const { disconnect, isProvider } = await import('@/lib/integrations');
  if (!isProvider(provider)) return;
  await disconnect(company.id, provider);
  revalidatePath('/dashboard/settings');
}
