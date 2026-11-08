import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { planFromLookupKey, stripe, verifyWebhook } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

/**
 * Stripe → HireKit. Add this endpoint in Stripe (Developers → Webhooks):
 *   https://YOUR-DOMAIN/api/stripe/webhook
 * Events: checkout.session.completed, customer.subscription.updated,
 *         customer.subscription.deleted
 */
export async function POST(req: Request) {
  const raw = await req.text();
  if (!verifyWebhook(raw, req.headers.get('stripe-signature'))) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }
  const event = JSON.parse(raw) as { type: string; data: { object: any } };
  const admin = createAdminClient();

  try {
    if (event.type === 'checkout.session.completed') {
      const s = event.data.object;
      const companyId: string | undefined = s.client_reference_id || s.metadata?.company_id;
      if (companyId && s.subscription) {
        const sub = await stripe(`subscriptions/${s.subscription}`, {}, 'GET');
        await applySubscription(admin, companyId, sub);
      }
    } else if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
      const sub = event.data.object;
      let companyId: string | undefined = sub.metadata?.company_id;
      if (!companyId) {
        const { data } = await admin.from('billing').select('company_id').eq('stripe_subscription_id', sub.id).maybeSingle();
        companyId = data?.company_id;
      }
      if (companyId) await applySubscription(admin, companyId, sub);
    }
  } catch (err) {
    console.error('Stripe webhook failed', err);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
  return NextResponse.json({ received: true });
}

async function applySubscription(admin: ReturnType<typeof createAdminClient>, companyId: string, sub: any) {
  const price = sub.items?.data?.[0]?.price;
  const parsed = planFromLookupKey(price?.lookup_key);
  const ended = sub.status === 'canceled' || sub.status === 'incomplete_expired';
  const periodEnd = sub.current_period_end ?? sub.items?.data?.[0]?.current_period_end;

  await admin.from('billing').upsert(
    {
      company_id: companyId,
      // A cancelled subscription falls back to an expired trial (jobs go offline).
      plan: ended ? 'trial' : parsed?.plan ?? 'starter',
      billing_interval: ended ? null : parsed?.interval ?? null,
      status: sub.status,
      trial_ends_at: ended ? new Date().toISOString() : undefined,
      current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
      cancel_at_period_end: !!sub.cancel_at_period_end,
      stripe_customer_id: typeof sub.customer === 'string' ? sub.customer : sub.customer?.id,
      stripe_subscription_id: ended ? null : sub.id,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'company_id' },
  );
}
