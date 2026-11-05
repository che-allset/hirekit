'use client';

import { useRef, useState } from 'react';

const MAX_MB = 5;

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
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const data = new FormData(e.currentTarget);

    const cv = data.get('cv');
    if (cv instanceof File && cv.size > 0) {
      if (cv.type !== 'application/pdf') return setError('Please upload your CV as a PDF.');
      if (cv.size > MAX_MB * 1024 * 1024) return setError(`Your CV must be under ${MAX_MB} MB.`);
    }

    setState('sending');
    try {
      const res = await fetch('/api/apply', { method: 'POST', body: data });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(json.error || 'Something went wrong. Please try again.');
      setState('done');
      formRef.current?.reset();
    } catch (err) {
      setState('idle');
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  }

  if (state === 'done') {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-xl text-white">
          ✓
        </div>
        <h3 className="mt-4 text-lg font-semibold">Application sent</h3>
        <p className="mt-1 text-sm text-ink-soft">
          Thanks for applying for {jobTitle}. The {companyName} team will be in touch.
        </p>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="space-y-4" noValidate={false}>
      <input type="hidden" name="job_id" value={jobId} />
      {/* Honeypot: hidden from people, catches simple bots */}
      <input type="text" name="company_website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" name="full_name" required autoComplete="name" />
        <Field label="Email" name="email" type="email" required autoComplete="email" />
        <Field label="Phone" name="phone" type="tel" autoComplete="tel" optional />
        <Field label="LinkedIn" name="linkedin_url" placeholder="linkedin.com/in/…" optional />
      </div>
      <Field label="Portfolio or website" name="portfolio_url" placeholder="https://" optional />

      <div>
        <label className="label" htmlFor="cv">
          CV <span className="font-normal text-ink-mute">(PDF, max {MAX_MB} MB)</span>
        </label>
        <label
          htmlFor="cv"
          className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-dashed border-black/15 bg-white px-4 py-4 text-sm transition hover:border-black/30"
        >
          <span className={fileName ? 'truncate font-medium' : 'text-ink-mute'}>{fileName ?? 'Choose a PDF file'}</span>
          <span className="flex-none rounded-lg bg-paper-warm px-3 py-1.5 text-xs font-semibold">Browse</span>
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

      <div>
        <label className="label" htmlFor="cover_letter">
          Why this role? <span className="font-normal text-ink-mute">(optional)</span>
        </label>
        <textarea
          id="cover_letter"
          name="cover_letter"
          rows={5}
          maxLength={5000}
          className="input resize-y"
          placeholder="A few lines about your experience and what draws you to this role."
        />
      </div>

      <label className="flex items-start gap-3 text-sm text-ink-soft">
        <input type="checkbox" name="consent" required className="mt-1 h-4 w-4 rounded border-black/20" />
        <span>
          I agree that {companyName} may process my application data for this and similar roles. An AI assistant helps
          the team review applications; all decisions are made by people.
        </span>
      </label>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={state === 'sending'}
        className="btn w-full py-3 text-base text-white hover:opacity-90"
        style={{ backgroundColor: brandColor }}
      >
        {state === 'sending' ? 'Sending application…' : 'Submit application'}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = 'text',
  required,
  optional,
  placeholder,
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  optional?: boolean;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <div>
      <label className="label" htmlFor={name}>
        {label} {optional && <span className="font-normal text-ink-mute">(optional)</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        maxLength={300}
        className="input"
      />
    </div>
  );
}
