'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import type { Dict, Locale } from '@/i18n';

type Result = {
  score: number;
  verdict: 'strong' | 'possible' | 'weak';
  summary: string;
  strengths: string[];
  gaps: string[];
  questions: string[];
};

const VERDICT_STYLE: Record<Result['verdict'], { color: string; bg: string }> = {
  strong: { color: '#1D5C47', bg: '#DCEBE4' },
  possible: { color: '#9A6B00', bg: '#FFF3C7' },
  weak: { color: '#B3321F', bg: '#FBE3DF' },
};

type T = Dict['tryIt'];

export function TryIt({ t, locale }: { t: T; locale: Locale }) {
  const samples = t.samples;
  const [requirements, setRequirements] = useState(t.requirements);
  const [text, setText] = useState(samples[0]!);
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
    fd.set('title', t.role);
    fd.set('lang', locale);
    fd.set('requirements', requirements);
    fd.set('application', text);
    if (file) fd.set('cv', file);
    try {
      const res = await fetch('/api/try', { method: 'POST', body: fd });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((json as { error?: string }).error || t.error);
      setResult(json as Result);
    } catch (e) {
      setError(e instanceof Error ? e.message : t.error);
    } finally {
      setState('idle');
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Input */}
      <div className="rounded-[14px] bg-white p-6 md:p-8">
        <p className="text-sm font-bold text-graphite-600">{t.roleLabel} {t.role}</p>
        <label className="label mt-5" htmlFor="try-req">
          {t.mustHaves}
        </label>
        <textarea id="try-req" rows={5} className="input resize-y text-[14px] leading-relaxed" value={requirements} onChange={(e) => setRequirements(e.target.value)} maxLength={1500} />

        <div className="mt-5 flex items-center justify-between gap-3">
          <label className="label mb-0" htmlFor="try-app">
            {t.application}
          </label>
          <div className="flex gap-1.5">
            {samples.map((sample, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setText(sample);
                  setFile(null);
                  if (fileRef.current) fileRef.current.value = '';
                  setResult(null);
                }}
                className={cn(
                  'rounded-full border px-3 py-1 text-xs font-bold',
                  text === sample ? 'border-graphite bg-graphite text-white' : 'border-graphite/15 hover:border-graphite/40',
                )}
              >
                {i === 0 ? t.sampleA : t.sampleB}
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
          placeholder={t.placeholder}
        />
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
          <label className="cursor-pointer font-bold underline underline-offset-4">
            {file ? t.change : t.upload}
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
                {t.remove}
              </button>
            </span>
          )}
        </div>

        <button type="button" onClick={run} disabled={state === 'loading'} className="btn-signal mt-6 w-full py-4 text-base">
          {state === 'loading' ? t.scoring : t.score}
        </button>
        <p className="mt-3 text-xs text-graphite-400">{t.stored}</p>
      </div>

      {/* Output */}
      <div className="flex min-h-[420px] flex-col rounded-[14px] bg-graphite p-6 text-white md:p-8" aria-live="polite">
        {error && <p className="rounded-[10px] bg-flag/20 p-4 text-sm">{error}</p>}

        {!result && !error && (
          <div className="m-auto max-w-xs text-center">
            {state === 'loading' ? (
              <>
                <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-white/15 border-t-signal" />
                <p className="mt-5 text-white/70">{t.loading}</p>
              </>
            ) : (
              <>
                <p className="font-display text-3xl">{t.emptyTitle}</p>
                <p className="mt-3 text-white/60">{t.emptySub}</p>
              </>
            )}
          </div>
        )}

        {result && <ResultCard r={result} t={t} />}
      </div>
    </div>
  );
}

function ResultCard({ r, t }: { r: Result; t: T }) {
  const v = VERDICT_STYLE[r.verdict] ?? VERDICT_STYLE.possible;
  const label = t.verdicts[r.verdict] ?? t.verdicts.possible;
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
            {label}
          </span>
          <p className="mt-3 leading-relaxed text-white/85">{r.summary}</p>
        </div>
      </div>

      <div className="mt-7 grid gap-6 sm:grid-cols-2">
        <List title={t.strengths} none={t.none} items={r.strengths} dot="bg-[#5FBF95]" />
        <List title={t.gaps} none={t.none} items={r.gaps} dot="bg-signal" />
      </div>

      {r.questions.length > 0 && (
        <div className="mt-7">
          <p className="text-sm font-bold">{t.askInterview}</p>
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
        {t.cta}
      </Link>
    </div>
  );
}

function List({ title, items, dot, none }: { title: string; items: string[]; dot: string; none: string }) {
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
          <li className="text-white/50">{none}</li>
        )}
      </ul>
    </div>
  );
}
