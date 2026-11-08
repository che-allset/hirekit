'use client';

import Link from 'next/link';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { Dict } from '@/i18n';
import { FEATURED_PLAN, PAID_PLANS, PRICES } from '@/lib/plans';

type Billing = 'monthly' | 'yearly';

// Prices and limits live in lib/plans; all wording comes from the dictionary.
const PLANS = PAID_PLANS.map((key) => ({ key, ...PRICES[key], featured: key === FEATURED_PLAN }));

export function Pricing({ t }: { t: Dict['pricing'] }) {
  const [billing, setBilling] = useState<Billing>('yearly');

  return (
    <div>
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-xl">
          <h2 className="font-display text-4xl leading-[1.05] md:text-5xl">{t.title}</h2>
          <p className="mt-4 text-lg text-graphite-600">
            {t.sub}
          </p>
        </div>
        <div role="radiogroup" aria-label={t.billing} className="inline-flex self-start rounded-full bg-white p-1 shadow-card md:self-auto">
          {(['monthly', 'yearly'] as const).map((b) => (
            <button
              key={b}
              type="button"
              role="radio"
              aria-checked={billing === b}
              onClick={() => setBilling(b)}
              className={cn(
                'rounded-full px-5 py-2 text-sm font-bold transition-colors',
                billing === b ? 'bg-graphite text-white' : 'text-graphite-600 hover:text-graphite',
              )}
            >
              {b === 'monthly' ? t.monthly : t.yearly}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-10 flex flex-col gap-1 rounded-[14px] border-2 border-dashed border-graphite/20 px-6 py-4 sm:flex-row sm:items-center sm:gap-3">
        <span className="font-bold">{t.trialTitle}</span>
        <span className="text-graphite-600">{t.trialText}</span>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {t.plans.map((p, i) => {
          const pr = PLANS[i]!;
          const price = billing === 'monthly' ? pr.month : pr.year;
          const featured = !!pr.featured;
          return (
            <div
              key={p.name}
              className={cn(
                'flex flex-col rounded-[14px] p-7',
                featured ? 'bg-graphite text-white ring-4 ring-signal' : 'bg-white text-graphite',
              )}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display text-3xl">{p.name}</h3>
                {featured && <span className="chip bg-signal text-graphite">{t.popular}</span>}
              </div>
              <p className={cn('mt-1 text-sm', featured ? 'text-white/70' : 'text-graphite-600')}>{p.who}</p>
              <p className="mt-8 flex items-baseline gap-2">
                <span className="font-display text-5xl tabular-nums">€{price}</span>
                <span className={cn('text-sm', featured ? 'text-white/70' : 'text-graphite-600')}>
                  {billing === 'monthly' ? t.perMonth : t.perMonthYearly}
                </span>
              </p>
              <ul className="mt-8 space-y-3 text-[15px]">
                {p.points.map((pt) => (
                  <li key={pt} className="flex gap-3">
                    <Tick className={featured ? 'text-signal' : 'text-forest'} />
                    {pt}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className={cn('mt-10', featured ? 'btn-signal' : 'btn-primary')}>
                {p.cta}
              </Link>
            </div>
          );
        })}
      </div>

      <details className="group mt-6 rounded-[14px] bg-white">
        <summary className="flex cursor-pointer list-none items-center justify-between px-7 py-5 font-bold [&::-webkit-details-marker]:hidden">
          {t.compare}
          <span className="text-2xl leading-none transition-transform group-open:rotate-45" aria-hidden="true">
            +
          </span>
        </summary>
        <div className="overflow-x-auto px-7 pb-7">
          <table className="w-full min-w-[620px] text-left text-[15px]">
            <thead>
              <tr className="border-b border-graphite/10">
                <th className="py-3 font-normal text-graphite-600">{t.feature}</th>
                {t.plans.map((p) => (
                  <th key={p.name} className="py-3 font-bold">
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {t.rows.map((row) => (
                <tr key={row.label} className="border-b border-graphite/5 last:border-0">
                  <td className="py-3 pr-4 text-graphite-600">{row.label}</td>
                  {row.values.map((v, i) => (
                    <td key={i} className={cn('py-3 pr-4', v === t.no && 'text-graphite-400')}>
                      {v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}

function Tick({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={cn('mt-0.5 h-5 w-5 flex-none', className)} aria-hidden="true">
      <path d="M4 10.5l4 4 8-9" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
