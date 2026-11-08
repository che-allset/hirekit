import { requireCompany } from '@/lib/company';
import { countOpenRoles, getBilling } from '@/lib/billing';
import { isStripeConfigured } from '@/lib/stripe';
import { PageHeader } from '../_components/ui';
import { getDict } from '@/i18n/server';
import { fmt } from '@/i18n';
import { PlanPicker } from './PlanPicker';

export default async function BillingPage({ searchParams }: { searchParams: { checkout?: string } }) {
  const { company } = await requireCompany();
  const { locale, t } = getDict();
  const b = t.dash.billing;
  const billing = await getBilling(company);
  const openRoles = await countOpenRoles(company.id);
  const dateFmt = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric' });
  const limit = (n: number) => (Number.isFinite(n) ? String(n) : b.unlimited);

  let status: string;
  if (billing.plan === 'demo') status = b.demoNote;
  else if (billing.trial) status = billing.active ? fmt(b.trialActive, { days: billing.daysLeft }) : b.trialEnded;
  else if (!billing.active) status = b.inactive;
  else if (billing.row?.cancel_at_period_end && billing.row.current_period_end)
    status = fmt(b.endsOn, { date: dateFmt.format(new Date(billing.row.current_period_end)) });
  else if (billing.row?.current_period_end) status = fmt(b.renewsOn, { date: dateFmt.format(new Date(billing.row.current_period_end)) });
  else status = b.activeStatus;

  const planName =
    billing.plan === 'demo' ? b.demoPlan : billing.plan === 'trial' ? b.trialPlan : t.pricing.plans[['starter', 'growth', 'scale'].indexOf(billing.plan)]?.name;

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title={b.title} sub={b.sub} />

      {searchParams.checkout === 'success' && (
        <p className="mb-6 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{b.success}</p>
      )}
      {searchParams.checkout === 'cancelled' && (
        <p className="mb-6 rounded-xl bg-paper-warm px-4 py-3 text-sm text-ink-soft">{b.cancelled}</p>
      )}

      <section className="card grid gap-6 p-6 sm:grid-cols-3">
        <div>
          <p className="text-sm text-ink-mute">{b.currentPlan}</p>
          <p className="mt-1 font-display text-3xl">{planName}</p>
          <p className={`mt-1 text-sm ${billing.active ? 'text-ink-soft' : 'font-semibold text-rose-700'}`}>{status}</p>
        </div>
        <div>
          <p className="text-sm text-ink-mute">{b.openRoles}</p>
          <p className="mt-1 font-display text-3xl tabular-nums">
            {openRoles} <span className="text-lg text-ink-mute">/ {limit(billing.limits.roles)}</span>
          </p>
        </div>
        <div>
          <p className="text-sm text-ink-mute">{b.screenings}</p>
          <p className="mt-1 font-display text-3xl tabular-nums">{limit(billing.limits.screenings)}</p>
          <p className="mt-1 text-sm text-ink-soft">{b.perMonth}</p>
        </div>
      </section>

      {billing.plan !== 'demo' && (
        <PlanPicker
          t={b}
          pricing={t.pricing}
          current={billing.trial ? null : billing.plan === 'trial' ? null : billing.plan}
          hasSubscription={!!billing.row?.stripe_subscription_id}
          configured={isStripeConfigured()}
        />
      )}
    </div>
  );
}
