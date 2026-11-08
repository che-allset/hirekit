import { NextResponse } from 'next/server';
import { screenCandidate } from '@/lib/ai';
import type { Job } from '@/lib/types';
import { AI_LANGUAGE, DICTS, isLocale } from '@/i18n';
import { getLocale } from '@/i18n/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

const MAX_PDF = 3 * 1024 * 1024;

// Light abuse protection for a public, no-signup endpoint: a few runs per
// visitor per 10 minutes (per server instance), plus strict input limits.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_RUNS = 6;
const hits = new Map<string, number[]>();

function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_RUNS) return true;
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

const bad = (error: string, status = 400) => NextResponse.json({ error }, { status });

/** Public "try it" screening on the landing page. Nothing is stored. */
export async function POST(req: Request) {
  const ip = (req.headers.get('x-forwarded-for') ?? 'local').split(',')[0]!.trim();
  // Visitor's language (cookie / browser) until the form tells us the page language.
  let E = DICTS[getLocale()].tryIt.errors;
  if (limited(ip)) return bad(E.limit, 429);

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return bad(E.request);
  }

  const str = (k: string, max: number) => {
    const v = form.get(k);
    return typeof v === 'string' ? v.trim().slice(0, max) : '';
  };
  const title = str('title', 120) || 'Open role';
  const requirements = str('requirements', 1500);
  const text = str('application', 6000);
  const lang = str('lang', 5);
  const language = isLocale(lang) ? AI_LANGUAGE[lang] : 'English';
  if (isLocale(lang)) E = DICTS[lang].tryIt.errors;

  if (requirements.length < 15) return bad(E.requirements);

  let pdf: string | null = null;
  const file = form.get('cv');
  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_PDF) return bad(E.pdfSize);
    const buf = Buffer.from(await file.arrayBuffer());
    if (buf.subarray(0, 5).toString('latin1') !== '%PDF-') return bad(E.notPdf);
    pdf = buf.toString('base64');
  }
  if (!pdf && text.length < 40) return bad(E.empty);

  const job: Job = {
    id: 'demo',
    company_id: 'demo',
    title,
    department: null,
    location: null,
    work_mode: 'Hybrid',
    employment_type: 'Full-time',
    salary_range: null,
    description: '',
    requirements,
    status: 'open',
    created_at: new Date().toISOString(),
  };

  try {
    const result = await screenCandidate(job, { fullName: 'Candidate', coverLetter: text || null, cvPdfBase64: pdf, language });
    return NextResponse.json(result);
  } catch (err) {
    console.error('Try-it screening failed', err);
    return bad(E.busy, 503);
  }
}
