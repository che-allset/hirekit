import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { screenCandidate } from '@/lib/ai';
import { isEmail, safeUrl } from '@/lib/utils';
import type { Job } from '@/lib/types';
import { DICTS, fmt, isLocale } from '@/i18n';
import { canScreen, getBilling } from '@/lib/billing';

export const runtime = 'nodejs';
export const maxDuration = 60; // AI screening of a PDF can take a few seconds

const MAX_CV_BYTES = 5 * 1024 * 1024;

function bad(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

const text = (form: FormData, key: string, max = 300) => {
  const v = form.get(key);
  return typeof v === 'string' ? v.trim().slice(0, max) : '';
};

/**
 * Public endpoint behind every careers page and embedded widget.
 * 1. Validate input  2. Store CV privately  3. Save application  4. AI screening
 */
export async function POST(req: Request) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return bad(DICTS.en.apply.errors.invalid);
  }

  const langRaw = text(form, 'lang', 5);
  const E = DICTS[isLocale(langRaw) ? langRaw : 'en'].apply.errors;

  // Honeypot: real people never fill this hidden field.
  if (text(form, 'company_website')) return NextResponse.json({ ok: true });

  const jobId = text(form, 'job_id', 64);
  const fullName = text(form, 'full_name', 120);
  const email = text(form, 'email', 200).toLowerCase();
  const phone = text(form, 'phone', 40) || null;
  const linkedinUrl = safeUrl(text(form, 'linkedin_url'));
  const portfolioUrl = safeUrl(text(form, 'portfolio_url'));
  const coverLetter = text(form, 'cover_letter', 5000) || null;

  if (!/^[0-9a-f-]{36}$/i.test(jobId)) return bad(E.jobNotFound);
  if (fullName.length < 2) return bad(E.name);
  if (!isEmail(email)) return bad(E.email);
  if (form.get('consent') !== 'on') return bad(E.consent);

  const cv = form.get('cv');
  let cvBuffer: Buffer | null = null;
  if (cv instanceof File && cv.size > 0) {
    if (cv.size > MAX_CV_BYTES) return bad(fmt(E.size, { n: 5 }));
    cvBuffer = Buffer.from(await cv.arrayBuffer());
    // Check the real file signature, not just the declared type.
    if (cvBuffer.subarray(0, 5).toString('latin1') !== '%PDF-') return bad(E.pdf);
  }

  const admin = createAdminClient();

  const { data: jobRow } = await admin.from('jobs').select('*').eq('id', jobId).eq('status', 'open').maybeSingle();
  if (!jobRow) return bad(E.closed, 404);
  const job = jobRow as Job;

  // Companies whose trial or subscription has ended don't accept applications.
  const { data: companyRow } = await admin.from('companies').select('id, slug').eq('id', job.company_id).maybeSingle();
  if (!companyRow || !(await getBilling(companyRow)).active) return bad(E.closed, 404);

  // Basic duplicate protection: one application per email per job.
  const { count } = await admin
    .from('applications')
    .select('id', { count: 'exact', head: true })
    .eq('job_id', job.id)
    .eq('email', email);
  if ((count ?? 0) > 0) return bad(E.duplicate, 409);

  let cvPath: string | null = null;
  if (cvBuffer) {
    cvPath = `${job.company_id}/${crypto.randomUUID()}.pdf`;
    const { error } = await admin.storage
      .from('cvs')
      .upload(cvPath, cvBuffer, { contentType: 'application/pdf', upsert: false });
    if (error) {
      console.error('CV upload failed', error);
      return bad(E.upload, 500);
    }
  }

  const { data: app, error: insertError } = await admin
    .from('applications')
    .insert({
      job_id: job.id,
      company_id: job.company_id,
      full_name: fullName,
      email,
      phone,
      linkedin_url: linkedinUrl,
      portfolio_url: portfolioUrl,
      cover_letter: coverLetter,
      cv_path: cvPath,
    })
    .select('id')
    .single();

  if (insertError || !app) {
    console.error('Application insert failed', insertError);
    return bad(E.save, 500);
  }

  // AI screening. If it fails (or the monthly screening allowance is used
  // up), the application is still saved and can be screened later.
  if (!(await canScreen(companyRow))) return NextResponse.json({ ok: true });
  try {
    const result = await screenCandidate(job, {
      fullName,
      linkedinUrl,
      portfolioUrl,
      coverLetter,
      cvPdfBase64: cvBuffer ? cvBuffer.toString('base64') : null,
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
      .eq('id', app.id);
  } catch (err) {
    console.error('AI screening failed', err);
    await admin.from('applications').update({ ai_status: 'failed' }).eq('id', app.id);
  }

  return NextResponse.json({ ok: true });
}
