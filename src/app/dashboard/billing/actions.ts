'use server';

import { getOrigin, requireCompany } from '@/lib/company';
import { getBilling } from '@/lib/billing';
import { createAdminClient } from '@/lib/supabase/admin';
import { ensurePrice, isStripeConfigured, stripe } from '@/lib/stripe';
import { isPaidPlan } from '@/lib/plans';
import { getLocale } from '@/i18n/server';
import { DICTS } from '@/i18n';

type Result = { url?: string; error?: string };

/** Sends the company to Stripe Checkout for the chosen plan. */
export async function startCheckout(plan: string, interval: string): Promise<Result> {
  const { company, user } = await requireCompany();
  const t = DICTS[getLocale()].dash.billing;
  if (!isStripeConfigured()) return { error: t.notConfigured };
  if (!isPaidPlan(plan) || (interval !== 'month' && interval !== 'year')) return { error: t.error };
  const billing = await getBilling(company);
  if (billing.plan === 'demo') return { error: t.demoNote };

  try {
    // Already subscribed: plan changes happen in the billing portal.
    if (billing.row?.stripe_subscription_id) return openPortal();

    const price = await ensurePrice(plan, interval);
    const origin = getOrigin();
    const locale = getLocale();
    const session = await stripe<{ url: string }>('checkout/sessions', {
      mode: 'subscription',
      line_items: [{ price, quantity: 1 }],
      success_url: `${origin}/dashboard/billing?checkout=success`,
      cancel_url: `${origin}/dashboard/billing?checkout=cancelled`,
      client_reference_id: company.id,
      metadata: { company_id: company.id },
      subscription_data: { metadata: { company_id: company.id } },
      ...(billing.row?.stripe_customer_id ? { customer: billing.row.stripe_customer_id } : { customer_email: user.email }),
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      tax_id_collection: { enabled: true },
      ...(process.env.STRIPE_AUTOMATIC_TAX === 'true' ? { automatic_tax: { enabled: true } } : {}),
      locale,
    });
    return { url: session.url };
  } catch (err) {
    console.error('Stripe checkout failed', err);
    return { error: t.error };
  }
}

/** Stripe's hosted billing portal: change plan, update card, download invoices, cancel. */
export async function openPortal(): Promise<Result> {
  const { company } = await requireCompany();
  const t = DICTS[getLocale()].dash.billing;
  if (!isStripeConfigured()) return { error: t.notConfigured };
  const { data } = await createAdminClient().from('billing').select('stripe_customer_id').eq('company_id', company.id).maybeSingle();
  if (!data?.stripe_customer_id) return { error: t.noSubscription };
  try {
    const session = await stripe<{ url: string }>('billing_portal/sessions', {
      customer: data.stripe_customer_id,
      return_url: `${getOrigin()}/dashboard/billing`,
      locale: getLocale(),
    });
    return { url: session.url };
  } catch (err) {
    console.error('Stripe portal failed', err);
    return { error: t.error };
  }
}
