'use client';

import { useRef, useState } from 'react';
import { cn, isEmail } from '@/lib/utils';

const MAX_MB = 5;
const STEPS = ['About you', 'Experience', 'Send'] as const;

export function ApplyForm({
  jobId,
  jobTitle,
  companyName,
  brandColor,
}: {
  jobId: string;
  jobTitle: string;
  companyName: string;
  brandColor: string;
}) {
  const [step, setStep] = useState(0);
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const value = (name: string) => {
    const v = formRef.current ? new FormData(formRef.current).get(name) : null;
    return typeof v === 'string' ? v.trim() : '';
  };

  function validate(i: number): string | null {
    if (i === 0) {
      if (value('full_name').length < 2) return 'Enter your full name.';
      if (!isEmail(value('email'))) return 'Enter a valid email address so the team can reach you.';
    }
    if (i === 1 && formRef.current) {
      const cv = new FormData(formRef.current).get('cv');
      if (cv instanceof File && cv.size > 0) {
        if (cv.type !== 'application/pdf') return 'Upload your CV as a PDF.';
        if (cv.size > MAX_MB * 1024 * 1024) return `Your CV must be under ${MAX_MB} MB.`;
      }
    }
    if (i === 2 && formRef.current) {
      if (new FormData(formRef.current).get('consent') !== 'on') return 'Tick the consent box to send your application.';
    }
    return null;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const problem = validate(step);
    if (problem) return setError(problem);
    setError(null);
    if (step < STEPS.length - 1) return setStep(step + 1);

    setState('sending');
    try {
      const res = await fetch('/api/apply', { method: 'POST', body: new FormData(e.currentTarget) });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(json.error || 'Your application could not be sent. Try again in a moment.');
      setState('done');
    } catch (err) {
      setState('idle');
      setError(err instanceof Error ? err.message : 'Your application could not be sent. Try again in a moment.');
    }
  }

  if (state === 'done') {
    return (
      <div className="rounded-[14px] bg-forest-100 p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-forest text-white">
          <svg viewBox="0 0 20 20" className="h-6 w-6" aria-hidden="true">
            <path d="M4 10.5l4 4 8-9" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h3 className="mt-4 text-lg font-bold">Application sent</h3>
        <p className="mt-1 text-sm text-graphite-600">
          {companyName} has your application for {jobTitle}. They’ll contact you by email.
        </p>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate>
      <input type="hidden" name="job_id" value={jobId} />
      {/* Honeypot: hidden from people, catches simple bots */}
      <input type="text" name="company_website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      <ol className="mb-6 grid grid-cols-3 gap-2" aria-label="Application progress">
        {STEPS.map((s, i) => (
          <li key={s} aria-current={i === step ? 'step' : undefined}>
            <div className="h-1.5 rounded-full" style={{ backgroundColor: i <= step ? brandColor : 'rgba(35,39,45,0.12)' }} />
            <p className={cn('mt-1.5 text-xs', i === step ? 'font-bold text-graphite' : 'text-graphite-400')}>{s}</p>
          </li>
        ))}
      </ol>

      <div className={cn('space-y-4', step !== 0 && 'hidden')}>
        <Field label="Full name" name="full_name" autoComplete="name" />
        <Field label="Email" name="email" type="email" autoComplete="email" />
        <Field label="Phone" name="phone" type="tel" autoComplete="tel" optional />
      </div>

      <div className={cn('space-y-4', step !== 1 && 'hidden')}>
        <div>
          <label className="label" htmlFor="cv">
            CV <span className="font-normal text-graphite-400">(PDF, up to {MAX_MB} MB)</span>
          </label>
          <label
            htmlFor="cv"
            className="flex cursor-pointer items-center justify-between gap-3 rounded-[10px] border border-dashed border-graphite/25 bg-white px-4 py-4 text-sm hover:border-graphite/50"
          >
            <span className={fileName ? 'truncate font-bold' : 'text-graphite-400'}>{fileName ?? 'Choose a PDF'}</span>
            <span className="flex-none rounded-[8px] bg-steel px-3 py-1.5 text-xs font-bold">Browse</span>
          </label>
          <input
            id="cv"
            name="cv"
            type="file"
            accept="application/pdf"
            className="sr-only"
            onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
          />
        </div>
        <Field label="LinkedIn" name="linkedin_url" placeholder="linkedin.com/in/…" optional />
        <Field label="Portfolio or website" name="portfolio_url" placeholder="https://" optional />
      </div>

      <div className={cn('space-y-4', step !== 2 && 'hidden')}>
        <div>
          <label className="label" htmlFor="cover_letter">
            Why this role? <span className="font-normal text-graphite-400">(optional)</span>
          </label>
          <textarea
            id="cover_letter"
            name="cover_letter"
            rows={6}
            maxLength={5000}
            className="input resize-y"
            placeholder="A few lines about your experience and what draws you to the role."
          />
        </div>
        <label className="flex items-start gap-3 text-sm text-graphite-600">
          <input type="checkbox" name="consent" className="mt-0.5 h-4 w-4 rounded border-graphite/30" />
          <span>
            I agree that {companyName} may process my application for this and similar roles. An assistant helps the team
            read applications; every decision is made by a person.
          </span>
        </label>
      </div>

      {error && (
        <p className="mt-4 rounded-[10px] bg-flag/10 px-4 py-3 text-sm text-flag" role="alert">
          {error}
        </p>
      )}

      <div className="mt-6 flex gap-3">
        {step > 0 && (
          <button type="button" onClick={() => setStep(step - 1)} className="btn-ghost">
            Back
          </button>
        )}
        <button
          type="submit"
          disabled={state === 'sending'}
          className="btn flex-1 py-3.5 text-white hover:opacity-90"
          style={{ backgroundColor: brandColor }}
        >
          {step < STEPS.length - 1 ? 'Continue' : state === 'sending' ? 'Sending…' : 'Send application'}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  type = 'text',
  optional,
  placeholder,
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  optional?: boolean;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <div>
      <label className="label" htmlFor={name}>
        {label} {optional && <span className="font-normal text-graphite-400">(optional)</span>}
      </label>
      <input id={name} name={name} type={type} placeholder={placeholder} autoComplete={autoComplete} maxLength={300} className="input" />
    </div>
  );
}
