'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';

type Result = {
  score: number;
  verdict: 'strong' | 'possible' | 'weak';
  summary: string;
  strengths: string[];
  gaps: string[];
  questions: string[];
};

const ROLE = {
  title: 'Customer Success Manager',
  requirements: `- 3+ years in customer success or account management for B2B software
- Fluent German and English
- Proven record of improving retention or expansion
- Confident running trainings and workshops`,
};

const SAMPLES = [
  {
    label: 'Sample A',
    text: `Customer Success Manager, SaaS company in Munich (2021–today)
- Own 35 B2B accounts, €1.2M ARR
- Built an onboarding playbook that cut churn from 14% to 9% in a year
- Run monthly customer trainings in German and English
Before: Account Executive, 2 years. Languages: German (native), English (C1).`,
  },
  {
    label: 'Sample B',
    text: `Retail store supervisor, 2 years. I manage a team of 6 and handle customer complaints.
I'm good with people and want to move into tech. I speak English and some Spanish.`,
  },
];

const VERDICT: Record<Result['verdict'], { label: string; color: string; bg: string }> = {
  strong: { label: 'Strong match', color: '#1D5C47', bg: '#DCEBE4' },
  possible: { label: 'Possible match', color: '#9A6B00', bg: '#FFF3C7' },
  weak: { label: 'Weak match', color: '#B3321F', bg: '#FBE3DF' },
};

export function TryIt() {
  const [requirements, setRequirements] = useState(ROLE.requirements);
  const [text, setText] = useState(SAMPLES[0]!.text);
  const [file, setFile] = useState<File | null>(null);
  const [state, setState] = useState<'idle' | 'loading'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function run() {
    setError(null);
    setState('loading');
    setResult(null);
    const fd = new FormData();
    fd.set('title', ROLE.title);
    fd.set('requirements', requirements);
    fd.set('application', text);
    if (file) fd.set('cv', file);
    try {
      const res = await fetch('/api/try', { method: 'POST', body: fd });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((json as { error?: string }).error || 'Something went wrong. Try again.');
      setResult(json as Result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Try again.');
    } finally {
      setState('idle');
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Input */}
      <div className="rounded-[14px] bg-white p-6 md:p-8">
        <p className="text-sm font-bold text-graphite-600">Role: {ROLE.title}</p>
        <label className="label mt-5" htmlFor="try-req">
          Must-haves
        </label>
        <textarea id="try-req" rows={5} className="input resize-y text-[14px] leading-relaxed" value={requirements} onChange={(e) => setRequirements(e.target.value)} maxLength={1500} />

        <div className="mt-5 flex items-center justify-between gap-3">
          <label className="label mb-0" htmlFor="try-app">
            Application
          </label>
          <div className="flex gap-1.5">
            {SAMPLES.map((s) => (
              <button
                key={s.label}
                type="button"
                onClick={() => {
                  setText(s.text);
                  setFile(null);
                  if (fileRef.current) fileRef.current.value = '';
                  setResult(null);
                }}
                className={cn(
                  'rounded-full border px-3 py-1 text-xs font-bold',
                  text === s.text ? 'border-graphite bg-graphite text-white' : 'border-graphite/15 hover:border-graphite/40',
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
        <textarea
          id="try-app"
          rows={7}
          className="input mt-1.5 resize-y text-[14px] leading-relaxed"
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={6000}
          placeholder="Paste a CV or a few lines about the candidate."
        />
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
          <label className="cursor-pointer font-bold underline underline-offset-4">
            {file ? 'Change PDF' : 'Or upload a PDF CV'}
            <input
              ref={fileRef}
              type="file"
              accept="application/pdf"
              className="sr-only"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>
          {file && (
            <span className="text-graphite-600">
              {file.name}{' '}
              <button type="button" className="ml-1 text-flag" onClick={() => { setFile(null); if (fileRef.current) fileRef.current.value = ''; }}>
                Remove
              </button>
            </span>
          )}
        </div>

        <button type="button" onClick={run} disabled={state === 'loading'} className="btn-signal mt-6 w-full py-4 text-base">
          {state === 'loading' ? 'Reading the application…' : 'Score this application'}
        </button>
        <p className="mt-3 text-xs text-graphite-400">Nothing you paste here is stored.</p>
      </div>

      {/* Output */}
      <div className="flex min-h-[420px] flex-col rounded-[14px] bg-graphite p-6 text-white md:p-8" aria-live="polite">
        {error && <p className="rounded-[10px] bg-flag/20 p-4 text-sm">{error}</p>}

        {!result && !error && (
          <div className="m-auto max-w-xs text-center">
            {state === 'loading' ? (
              <>
                <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-white/15 border-t-signal" />
                <p className="mt-5 text-white/70">Reading against your must-haves…</p>
              </>
            ) : (
              <>
                <p className="font-display text-3xl">The assessment appears here.</p>
                <p className="mt-3 text-white/60">Try Sample A, then Sample B, and compare.</p>
              </>
            )}
          </div>
        )}

        {result && <ResultCard r={result} />}
      </div>
    </div>
  );
}

function ResultCard({ r }: { r: Result }) {
  const v = VERDICT[r.verdict] ?? VERDICT.possible;
  const C = 2 * Math.PI * 42;
  return (
    <div>
      <div className="flex items-center gap-5">
        <svg width="104" height="104" viewBox="0 0 104 104" className="flex-none" aria-hidden="true">
          <circle cx="52" cy="52" r="42" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="10" />
          <circle
            cx="52"
            cy="52"
            r="42"
            fill="none"
            stroke={r.verdict === 'strong' ? '#5FBF95' : r.verdict === 'possible' ? '#FFD12E' : '#F08A78'}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={C * (1 - r.score / 100)}
            transform="rotate(-90 52 52)"
          />
          <text x="52" y="64" textAnchor="middle" fill="#fff" style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 700 }}>
            {r.score}
          </text>
        </svg>
        <div>
          <span className="chip" style={{ background: v.bg, color: v.color }}>
            {v.label}
          </span>
          <p className="mt-3 leading-relaxed text-white/85">{r.summary}</p>
        </div>
      </div>

      <div className="mt-7 grid gap-6 sm:grid-cols-2">
        <List title="Strengths" items={r.strengths} dot="bg-[#5FBF95]" />
        <List title="Gaps to explore" items={r.gaps} dot="bg-signal" />
      </div>

      {r.questions.length > 0 && (
        <div className="mt-7">
          <p className="text-sm font-bold">Ask in the interview</p>
          <ol className="mt-2 space-y-2 text-sm text-white/85">
            {r.questions.map((q, i) => (
              <li key={i} className="rounded-[10px] bg-white/[0.07] px-4 py-2.5">
                {q}
              </li>
            ))}
          </ol>
        </div>
      )}

      <Link href="/signup" className="btn-signal mt-8 w-full">
        Screen your own applicants free
      </Link>
    </div>
  );
}

function List({ title, items, dot }: { title: string; items: string[]; dot: string }) {
  return (
    <div>
      <p className="text-sm font-bold">{title}</p>
      <ul className="mt-2 space-y-2 text-sm text-white/85">
        {items.length ? (
          items.map((s, i) => (
            <li key={i} className="flex gap-2.5">
              <span className={cn('mt-1.5 h-2 w-2 flex-none rounded-full', dot)} />
              {s}
            </li>
          ))
        ) : (
          <li className="text-white/50">None noted</li>
        )}
      </ul>
    </div>
  );
}
