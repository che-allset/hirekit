'use client';

import Link from 'next/link';
import { useState } from 'react';
import { cn, initials, isEmail } from '@/lib/utils';
import { LogoMark } from '@/components/Logo';
import { signUp } from '../actions';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { fmt, type Dict, type Locale } from '@/i18n';

const SIZES = ['1–10', '11–50', '51–200', '200+'];
const ROLE_COUNTS = ['1', '2–5', '6–15', '16+'];
const COLOURS = ['#1D5C47', '#23272D', '#2F5BD3', '#C2410C', '#7C3AED', '#0E7490'];

type Data = {
  company: string;
  website: string;
  size: string;
  roles: string;
  channels: string[];
  colour: string;
  email: string;
  password: string;
};

type T = Dict['auth']['signup'];

export function SignupForm({ t, locale, languageLabel }: { t: T; locale: Locale; languageLabel: string }) {
  const STEPS = t.steps;
  const CHANNELS = t.channelOptions;
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Data>({
    company: '',
    website: '',
    size: '',
    roles: '',
    channels: [],
    colour: COLOURS[0]!,
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const set = <K extends keyof Data>(k: K, v: Data[K]) => {
    setData((d) => ({ ...d, [k]: v }));
    setError(null);
  };

  function validate(i: number): string | null {
    if (i === 0 && data.company.trim().length < 2) return t.errors.company;
    if (i === 1 && !data.roles) return t.errors.roles;
    if (i === 3) {
      if (!isEmail(data.email.trim())) return t.errors.email;
      if (data.password.length < 8) return t.errors.password;
    }
    return null;
  }

  async function next(e: React.FormEvent) {
    e.preventDefault();
    const problem = validate(step);
    if (problem) return setError(problem);
    if (step < STEPS.length - 1) return setStep(step + 1);

    setPending(true);
    try {
      const res = await signUp({
        companyName: data.company,
        email: data.email,
        password: data.password,
        website: data.website,
        brandColor: data.colour,
      });
      // On success the action redirects; we only get here on error.
      if (res?.error) setError(res.error);
    } catch (err) {
      // A redirect after a successful sign-up is not an error.
      if ((err as { digest?: string })?.digest?.startsWith('NEXT_REDIRECT')) throw err;
      setError(t.errors.failed);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_0.9fr]">
      <div className="flex flex-col px-6 py-8 sm:px-12">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="inline-flex items-center gap-2.5 font-display text-[24px] leading-none">
            <LogoMark />
            HireKit
          </Link>
          <LanguageSwitcher locale={locale} label={languageLabel} />
        </div>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
          <Progress step={step} steps={STEPS} label={t.progress} />

          <form onSubmit={next} className="mt-10" noValidate>
            {step === 0 && (
              <Step title={t.companyTitle} sub={t.companySub}>
                <Field label={t.companyName}>
                  <input autoFocus className="input" value={data.company} onChange={(e) => set('company', e.target.value)} placeholder="Northwind Labs" autoComplete="organization" />
                </Field>
                <Field label={t.website} hint={t.optional}>
                  <input className="input" value={data.website} onChange={(e) => set('website', e.target.value)} placeholder="northwind.de" inputMode="url" />
                </Field>
                <Field label={t.teamSize}>
                  <Chips options={SIZES} value={data.size} onChange={(v) => set('size', v)} />
                </Field>
              </Step>
            )}

            {step === 1 && (
              <Step title={t.hiringTitle} sub={t.hiringSub}>
                <Field label={t.rolesPlanned}>
                  <Chips options={ROLE_COUNTS} value={data.roles} onChange={(v) => set('roles', v)} />
                </Field>
                <Field label={t.channels} hint={t.pickAny}>
                  <Chips
                    multi
                    options={CHANNELS}
                    values={data.channels}
                    onToggle={(v) =>
                      set('channels', data.channels.includes(v) ? data.channels.filter((c) => c !== v) : [...data.channels, v])
                    }
                  />
                </Field>
              </Step>
            )}

            {step === 2 && (
              <Step title={t.brandTitle} sub={t.brandSub}>
                <div className="flex flex-wrap gap-3">
                  {COLOURS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => set('colour', c)}
                      aria-label={`Use colour ${c}`}
                      aria-pressed={data.colour === c}
                      className={cn('h-11 w-11 rounded-full ring-offset-2 ring-offset-steel transition', data.colour === c && 'ring-[3px] ring-graphite')}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <div className="mt-6 overflow-hidden rounded-[14px] border border-graphite/10 bg-white">
                  <div className="p-5 text-white" style={{ backgroundColor: data.colour }}>
                    <div className="flex items-center gap-2 text-sm font-bold">
                      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-white/20 text-xs">
                        {initials(data.company || 'Co')}
                      </span>
                      {data.company || t.yourCompany}
                    </div>
                    <p className="mt-8 font-display text-3xl">{fmt(t.join, { company: data.company || t.us })}</p>
                  </div>
                  <div className="flex items-center justify-between p-4 text-sm">
                    <span className="font-bold">{t.firstRole}</span>
                    <span className="rounded-[8px] px-3 py-1.5 font-bold text-white" style={{ backgroundColor: data.colour }}>
                      {t.apply}
                    </span>
                  </div>
                </div>
              </Step>
            )}

            {step === 3 && (
              <Step title={t.accountTitle} sub={t.accountSub}>
                <Field label={t.workEmail}>
                  <input autoFocus type="email" className="input" value={data.email} onChange={(e) => set('email', e.target.value)} autoComplete="email" />
                </Field>
                <Field label={t.password} hint={t.passwordHint}>
                  <input type="password" className="input" value={data.password} onChange={(e) => set('password', e.target.value)} autoComplete="new-password" />
                </Field>
                <div className="rounded-[12px] bg-white p-4 text-sm">
                  <p className="font-bold">{data.company}</p>
                  <p className="mt-1 text-graphite-600">
                    {[data.size && fmt(t.people, { n: data.size }), data.roles && fmt(t.rolesSummary, { n: data.roles })].filter(Boolean).join(', ') || t.ready}
                  </p>
                </div>
              </Step>
            )}

            {error && (
              <p className="mt-5 rounded-[10px] bg-flag/10 px-4 py-3 text-sm text-flag" role="alert">
                {error}
              </p>
            )}

            <div className="mt-8 flex items-center gap-3">
              {step > 0 && (
                <button type="button" onClick={() => setStep(step - 1)} className="btn-ghost">
                  {t.back}
                </button>
              )}
              <button type="submit" disabled={pending} className="btn-signal flex-1 py-3.5">
                {step < STEPS.length - 1 ? t.continue : pending ? t.creating : t.create}
              </button>
            </div>
          </form>

          <p className="mt-8 text-center text-sm text-graphite-600">
            {t.haveAccount}{' '}
            <Link href="/login" className="font-bold text-graphite underline">
              {t.login}
            </Link>
          </p>
        </div>
      </div>

      <SidePanel step={step} texts={t.panel} />
    </div>
  );
}

function Progress({ step, steps, label }: { step: number; steps: string[]; label: string }) {
  return (
    <ol className="grid grid-cols-4 gap-2" aria-label={label}>
      {steps.map((s, i) => (
        <li key={s} aria-current={i === step ? 'step' : undefined}>
          <div className={cn('h-1.5 rounded-full transition-colors', i <= step ? 'bg-graphite' : 'bg-graphite/15')} />
          <p className={cn('mt-2 text-xs', i === step ? 'font-bold text-graphite' : 'text-graphite-400')}>
            {i + 1}. {s}
          </p>
        </li>
      ))}
    </ol>
  );
}

function Step({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <div>
      <h1 className="font-display text-4xl leading-[1.05]">{title}</h1>
      <p className="mt-3 text-graphite-600">{sub}</p>
      <div className="mt-8 space-y-6">{children}</div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="label">
        {label} {hint && <span className="font-normal text-graphite-400">({hint})</span>}
      </p>
      {children}
    </div>
  );
}

type ChipsProps =
  | { multi?: false; options: string[]; value: string; onChange: (v: string) => void }
  | { multi: true; options: string[]; values: string[]; onToggle: (v: string) => void };

function Chips(props: ChipsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {props.options.map((o) => {
        const active = props.multi ? props.values.includes(o) : props.value === o;
        return (
          <button
            key={o}
            type="button"
            aria-pressed={active}
            onClick={() => (props.multi ? props.onToggle(o) : props.onChange(o))}
            className={cn(
              'rounded-full border px-4 py-2 text-sm font-bold transition-colors',
              active ? 'border-graphite bg-graphite text-white' : 'border-graphite/15 bg-white hover:border-graphite/40',
            )}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}

const PANEL_PHOTOS = ['/photos/meeting.jpg', '/photos/interview.jpg', '/photos/laughing.jpg', '/photos/candidate.jpg'];

function SidePanel({ step, texts }: { step: number; texts: string[] }) {
  const p = { photo: PANEL_PHOTOS[step] ?? PANEL_PHOTOS[0]!, text: texts[step] ?? texts[0]! };
  return (
    <div className="relative hidden p-4 lg:block">
      <div className="duotone relative h-full rounded-[18px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img key={p.photo} src={p.photo} alt="" className="absolute inset-0 h-full w-full object-cover" />
      </div>
      <p className="absolute bottom-10 left-10 right-10 max-w-sm rounded-[12px] bg-signal p-5 text-lg font-bold leading-snug text-graphite">
        {p.text}
      </p>
    </div>
  );
}
