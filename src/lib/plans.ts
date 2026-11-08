import type { PlanKey } from './types';

/**
 * Plans and limits. Every plan includes every feature; plans differ by
 * how many roles can be open at once and how many applications the AI
 * screens per month. Prices in EUR; "year" is the per-month price when
 * billed yearly (about 20% off).
 */
export const TRIAL_DAYS = 7;

export const PLAN_LIMITS: Record<PlanKey | 'demo', { roles: number; screenings: number }> = {
  trial: { roles: 1, screenings: 50 },
  starter: { roles: 3, screenings: 200 },
  growth: { roles: 10, screenings: 1000 },
  scale: { roles: Infinity, screenings: 3000 },
  demo: { roles: Infinity, screenings: Infinity },
};

export const PAID_PLANS = ['starter', 'growth', 'scale'] as const;
export type PaidPlan = (typeof PAID_PLANS)[number];

export const PRICES: Record<PaidPlan, { month: number; year: number }> = {
  starter: { month: 49, year: 39 },
  growth: { month: 99, year: 79 },
  scale: { month: 199, year: 159 },
};

export const FEATURED_PLAN: PaidPlan = 'growth';

export function isPaidPlan(v: unknown): v is PaidPlan {
  return typeof v === 'string' && (PAID_PLANS as readonly string[]).includes(v);
}
