'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireCompany } from '@/lib/company';
import { createAdminClient } from '@/lib/supabase/admin';
import { draftJobPost, screenCandidate } from '@/lib/ai';
import { EMPLOYMENT_TYPES, STAGES, WORK_MODES, type Job, type Stage } from '@/lib/types';
import { isHexColor, safeUrl } from '@/lib/utils';

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

export async function saveJob(jobId: string | null, input: JobInput): Promise<Result> {
  const { supabase, company } = await requireCompany();
  const job = cleanJob(input);
  if (job.title.length < 2) return { error: 'Give the role a title.' };
  if (job.description.length < 20) return { error: 'Add a short description (or use “Draft with AI”).' };

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

export async function setJobStatus(jobId: string, status: 'open' | 'closed') {
  const { supabase, company } = await requireCompany();
  await supabase.from('jobs').update({ status }).eq('id', jobId).eq('company_id', company.id);
  revalidatePath('/dashboard', 'layout');
}

export async function deleteJob(jobId: string) {
  const { supabase, company } = await requireCompany();
  await supabase.from('jobs').delete().eq('id', jobId).eq('company_id', company.id);
  revalidatePath('/dashboard', 'layout');
  redirect('/dashboard/jobs');
}

export async function generateJobDraft(input: {
  title: string;
  location: string;
  workMode: string;
  notes: string;
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
  if (error) return { error: error.message };
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
