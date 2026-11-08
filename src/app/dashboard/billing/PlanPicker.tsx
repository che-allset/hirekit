'use client';

import { useState, useTransition } from 'react';
import { cn } from '@/lib/utils';
import { FEATURED_PLAN, PAID_PLANS, PLAN_LIMITS, PRICES } from '@/lib/plans';
import type { Dict } from '@/i18n';
import { openPortal, startCheckout } from './actions';

export function PlanPicker({
  t,
  pricing,
  current,
  hasSubscription,
  configured,
}: {
  t: Dict['dash']['billing'];
  pricing: Dict['pricing'];
  current: string | null;
  hasSubscription: boolean;
  configured: boolean;
}) {
  const [interval, setInterval] = useState<'month' | 'year'>('year');
  const [error, setError] = useState<string | null>(null);
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const go = (key: string, fn: () => Promise<{ url?: string; error?: string }>) => {
    setError(null);
    setPendingKey(key);
    startTransition(async () => {
      const res = await fn().catch(() => ({ url: undefined, error: t.error }));
      if (res.url) window.location.href = res.url;
      else {
        setError(res.error ?? t.error);
        setPendingKey(null);
      }
    });
  };

  return (
    <div className="mt-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl">{hasSubscription ? t.changePlan : t.choosePlan}</h2>
          <p className="mt-1 text-sm text-ink-soft">{t.everyPlan}</p>
        </div>
        <div role="radiogroup" aria-label={pricing.billing} className="inline-flex self-start rounded-full bg-white p-1 shadow-card">
          {(['month', 'year'] as const).map((iv) => (
            <button
              key={iv}
              type="button"
              role="radio"
              aria-checked={interval === iv}
              onClick={() => setInterval(iv)}
              className={cn(
                'rounded-full px-4 py-1.5 text-sm font-bold transition-colors',
                interval === iv ? 'bg-ink text-white' : 'text-ink-soft hover:text-ink',
              )}
            >
              {iv === 'month' ? pricing.monthly : pricing.yearly}
            </button>
          ))}
        </div>
      </div>

      {!configured && <p className="mt-6 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">{t.notConfigured}</p>}
      {error && configured && <p className="mt-6 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-800" role="alert">{error}</p>}

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {PAID_PLANS.map((plan, i) => {
          const p = pricing.plans[i]!;
          const featured = plan === FEATURED_PLAN;
          const isCurrent = current === plan;
          const roles = PLAN_LIMITS[plan].roles;
          return (
            <div key={plan} className={cn('card flex flex-col p-6', featured && 'ring-2 ring-signal')}>
              <div className="flex items-center justify-between">
                <h3 className="font-display text-2xl">{p.name}</h3>
                {isCurrent && <span className="chip bg-emerald-50 text-emerald-700">{t.current}</span>}
              </div>
              <p className="mt-1 text-sm text-ink-soft">{p.who}</p>
              <p className="mt-6 flex items-baseline gap-2">
                <span className="font-display text-4xl tabular-nums">€{PRICES[plan][interval]}</span>
                <span className="text-sm text-ink-soft">{interval === 'month' ? pricing.perMonth : pricing.perMonthYearly}</span>
              </p>
              <ul className="mt-6 flex-1 space-y-2 text-sm">
                <li>{Number.isFinite(roles) ? `${roles} ${t.rolesSuffix}` : t.unlimitedRoles}</li>
                <li>
                  {PLAN_LIMITS[plan].screenings.toLocaleString()} {t.screeningsSuffix}
                </li>
              </ul>
              <button
                type="button"
                disabled={!configured || isCurrent || pendingKey !== null}
                onClick={() => go(plan, () => startCheckout(plan, interval))}
                className={cn('mt-6', featured ? 'btn-signal' : 'btn-primary', 'disabled:cursor-not-allowed disabled:opacity-50')}
              >
                {pendingKey === plan ? t.redirecting : isCurrent ? t.current : hasSubscription ? t.switchTo : t.choose}
              </button>
            </div>
          );
        })}
      </div>

      {hasSubscription && configured && (
        <button
          type="button"
          onClick={() => go('portal', openPortal)}
          disabled={pendingKey !== null}
          className="btn-ghost mt-6"
        >
          {pendingKey === 'portal' ? t.redirecting : t.manage}
        </button>
      )}
      <p className="mt-6 text-xs text-ink-mute">{t.secureNote}</p>
    </div>
  );
}
