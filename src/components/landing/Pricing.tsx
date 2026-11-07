'use client';

import Link from 'next/link';
import { useState } from 'react';
import { cn } from '@/lib/utils';

type Billing = 'monthly' | 'yearly';

const PLANS = [
  {
    name: 'Starter',
    who: 'For your first few hires.',
    monthly: 0,
    yearly: 0,
    cta: 'Start free',
    points: ['Up to 3 open roles', 'Careers page and website widget', '25 screened applications a month', 'One recruiter seat'],
  },
  {
    name: 'Team',
    who: 'For companies hiring every month.',
    monthly: 49,
    yearly: 39,
    cta: 'Start a 14-day trial',
    featured: true,
    points: [
      'Unlimited open roles',
      'Unlimited screened applications',
      'Job post writer',
      'Your own brand colours and logo',
      'Up to 5 recruiter seats',
    ],
  },
  {
    name: 'Scale',
    who: 'For agencies and multi-site employers.',
    monthly: 129,
    yearly: 99,
    cta: 'Talk to us',
    points: ['Everything in Team', 'Separate workspaces per client or site', 'Careers page on your own domain', 'Unlimited seats', 'Onboarding call'],
  },
] as const;

const COMPARE: { label: string; values: [string, string, string] }[] = [
  { label: 'Open roles', values: ['3', 'Unlimited', 'Unlimited'] },
  { label: 'Screened applications per month', values: ['25', 'Unlimited', 'Unlimited'] },
  { label: 'Recruiter seats', values: ['1', '5', 'Unlimited'] },
  { label: 'Careers page', values: ['Yes', 'Yes', 'Your own domain'] },
  { label: 'Website widget', values: ['Yes', 'Yes', 'Yes'] },
  { label: 'Job post writer', values: ['No', 'Yes', 'Yes'] },
  { label: 'Interview question suggestions', values: ['Yes', 'Yes', 'Yes'] },
  { label: 'Workspaces', values: ['1', '1', 'Per client or site'] },
  { label: 'Support', values: ['Email', 'Email, 1-day reply', 'Named contact'] },
];

export function Pricing() {
  const [billing, setBilling] = useState<Billing>('yearly');

  return (
    <div>
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-xl">
          <h2 className="font-display text-5xl leading-[0.95] md:text-6xl">Pay for the hiring you actually do.</h2>
          <p className="mt-4 text-lg text-graphite-600">
            Start free. Upgrade when you post more roles. Cancel from your dashboard any time.
          </p>
        </div>
        <div role="radiogroup" aria-label="Billing period" className="inline-flex self-start rounded-full bg-white p-1 shadow-card md:self-auto">
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
              {b === 'monthly' ? 'Monthly' : 'Yearly, save 20%'}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-12 grid gap-4 lg:grid-cols-3">
        {PLANS.map((p) => {
          const price = billing === 'monthly' ? p.monthly : p.yearly;
          const featured = 'featured' in p && p.featured;
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
                {featured && <span className="chip bg-signal text-graphite">Most teams pick this</span>}
              </div>
              <p className={cn('mt-1 text-sm', featured ? 'text-white/70' : 'text-graphite-600')}>{p.who}</p>
              <p className="mt-8 flex items-baseline gap-2">
                <span className="font-display text-6xl tabular-nums">€{price}</span>
                <span className={cn('text-sm', featured ? 'text-white/70' : 'text-graphite-600')}>
                  {price === 0 ? 'forever' : billing === 'monthly' ? 'per month' : 'per month, billed yearly'}
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
          Compare every feature
          <span className="text-2xl leading-none transition-transform group-open:rotate-45" aria-hidden="true">
            +
          </span>
        </summary>
        <div className="overflow-x-auto px-7 pb-7">
          <table className="w-full min-w-[620px] text-left text-[15px]">
            <thead>
              <tr className="border-b border-graphite/10">
                <th className="py-3 font-normal text-graphite-600">Feature</th>
                {PLANS.map((p) => (
                  <th key={p.name} className="py-3 font-bold">
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARE.map((row) => (
                <tr key={row.label} className="border-b border-graphite/5 last:border-0">
                  <td className="py-3 pr-4 text-graphite-600">{row.label}</td>
                  {row.values.map((v, i) => (
                    <td key={i} className={cn('py-3 pr-4', v === 'No' && 'text-graphite-400')}>
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
