import 'server-only';
import { createAdminClient } from './supabase/admin';
import { DEMO_SLUG } from './demo';
import { PLAN_LIMITS, TRIAL_DAYS } from './plans';
import type { BillingRow, Company, PlanKey } from './types';

export interface BillingState {
  plan: PlanKey | 'demo';
  /** Jobs can be open and applications accepted. */
  active: boolean;
  trial: boolean;
  trialEndsAt: Date | null;
  daysLeft: number;
  limits: { roles: number; screenings: number };
  row: BillingRow | null;
}

const PAYING = new Set(['active', 'trialing', 'past_due']);

/** Reads (or creates, with a fresh 7-day trial) the company's billing row. */
export async function getBilling(company: Pick<Company, 'id' | 'slug'>): Promise<BillingState> {
  if (company.slug === DEMO_SLUG) {
    return { plan: 'demo', active: true, trial: false, trialEndsAt: null, daysLeft: 0, limits: PLAN_LIMITS.demo, row: null };
  }
  const admin = createAdminClient();
  let { data } = await admin.from('billing').select('*').eq('company_id', company.id).maybeSingle();
  if (!data) {
    const trialEnds = new Date(Date.now() + TRIAL_DAYS * 864e5).toISOString();
    const inserted = await admin
      .from('billing')
      .upsert({ company_id: company.id, trial_ends_at: trialEnds }, { onConflict: 'company_id', ignoreDuplicates: true })
      .select('*')
      .maybeSingle();
    data = inserted.data ?? (await admin.from('billing').select('*').eq('company_id', company.id).maybeSingle()).data;
  }
  const row = (data as BillingRow | null) ?? null;
  if (!row) {
    // Table missing (migration not run yet): don't lock anyone out.
    return { plan: 'trial', active: true, trial: true, trialEndsAt: null, daysLeft: TRIAL_DAYS, limits: PLAN_LIMITS.trial, row: null };
  }
  if (row.plan === 'trial') {
    const ends = new Date(row.trial_ends_at);
    const ms = ends.getTime() - Date.now();
    return {
      plan: 'trial',
      active: ms > 0,
      trial: true,
      trialEndsAt: ends,
      daysLeft: Math.max(0, Math.ceil(ms / 864e5)),
      limits: PLAN_LIMITS.trial,
      row,
    };
  }
  const periodOk = !row.current_period_end || new Date(row.current_period_end).getTime() > Date.now() - 3 * 864e5;
  return {
    plan: row.plan,
    active: PAYING.has(row.status) && periodOk,
    trial: false,
    trialEndsAt: null,
    daysLeft: 0,
    limits: PLAN_LIMITS[row.plan],
    row,
  };
}

/** How many open roles the company has, optionally ignoring one job (the one being edited). */
export async function countOpenRoles(companyId: string, exceptJobId?: string | null) {
  const admin = createAdminClient();
  let q = admin.from('jobs').select('id', { count: 'exact', head: true }).eq('company_id', companyId).eq('status', 'open');
  if (exceptJobId) q = q.neq('id', exceptJobId);
  const { count } = await q;
  return count ?? 0;
}

/** Whether the AI may screen one more application this calendar month. */
export async function canScreen(company: Pick<Company, 'id' | 'slug'>) {
  const billing = await getBilling(company);
  if (!billing.active) return false;
  if (!Number.isFinite(billing.limits.screenings)) return true;
  const start = new Date();
  start.setUTCDate(1);
  start.setUTCHours(0, 0, 0, 0);
  const { count } = await createAdminClient()
    .from('applications')
    .select('id', { count: 'exact', head: true })
    .eq('company_id', company.id)
    .eq('ai_status', 'done')
    .gte('created_at', start.toISOString());
  return (count ?? 0) < billing.limits.screenings;
}
