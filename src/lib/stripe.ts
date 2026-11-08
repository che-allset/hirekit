import 'server-only';
import { createHmac, timingSafeEqual } from 'crypto';
import { PRICES, type PaidPlan } from './plans';

/**
 * Minimal Stripe client over fetch (no SDK needed).
 *
 * Env:
 *   STRIPE_SECRET_KEY       sk_test_… or sk_live_…
 *   STRIPE_WEBHOOK_SECRET   whsec_… (from the webhook endpoint in Stripe)
 *   STRIPE_AUTOMATIC_TAX    "true" once Stripe Tax is switched on (optional)
 *
 * Products and prices are created on first use and found again by lookup key
 * (hirekit_starter_month, hirekit_growth_year, …), so nothing has to be set up
 * by hand in the Stripe dashboard.
 */

export const isStripeConfigured = () => !!process.env.STRIPE_SECRET_KEY;

type Params = Record<string, unknown>;

/** Stripe-style form encoding: a[b][0][c]=d */
function encode(params: Params, prefix = '', out: string[] = []): string[] {
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    const k = prefix ? `${prefix}[${key}]` : key;
    if (Array.isArray(value)) {
      value.forEach((v, i) => {
        if (v !== null && typeof v === 'object') encode(v as Params, `${k}[${i}]`, out);
        else out.push(`${encodeURIComponent(`${k}[${i}]`)}=${encodeURIComponent(String(v))}`);
      });
    } else if (typeof value === 'object') {
      encode(value as Params, k, out);
    } else {
      out.push(`${encodeURIComponent(k)}=${encodeURIComponent(String(value))}`);
    }
  }
  return out;
}

export async function stripe<T = any>(path: string, params: Params = {}, method: 'GET' | 'POST' | 'DELETE' = 'POST'): Promise<T> {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('Stripe is not configured');
  const body = encode(params).join('&');
  const url = `https://api.stripe.com/v1/${path}${method === 'GET' && body ? `?${body}` : ''}`;
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Stripe-Version': '2024-06-20',
    },
    body: method === 'GET' ? undefined : body,
    cache: 'no-store',
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error?.message || `Stripe error ${res.status}`);
  return json as T;
}

const lookupKey = (plan: PaidPlan, interval: 'month' | 'year') => `hirekit_${plan}_${interval}`;

/** Finds the price for a plan, creating product + price the first time. */
export async function ensurePrice(plan: PaidPlan, interval: 'month' | 'year'): Promise<string> {
  const key = lookupKey(plan, interval);
  const found = await stripe<{ data: { id: string }[] }>('prices', { 'lookup_keys[]': key, active: true, limit: 1 }, 'GET');
  if (found.data[0]) return found.data[0].id;

  const productName = `HireKit ${plan.charAt(0).toUpperCase()}${plan.slice(1)}`;
  const products = await stripe<{ data: { id: string; metadata: Record<string, string> }[] }>(
    'products/search',
    { query: `metadata['hirekit_plan']:'${plan}'` },
    'GET',
  ).catch(() => ({ data: [] as { id: string; metadata: Record<string, string> }[] }));
  const productId =
    products.data[0]?.id ??
    (await stripe<{ id: string }>('products', { name: productName, metadata: { hirekit_plan: plan } })).id;

  const monthly = PRICES[plan][interval];
  const price = await stripe<{ id: string }>('prices', {
    product: productId,
    currency: 'eur',
    unit_amount: interval === 'year' ? monthly * 12 * 100 : monthly * 100,
    recurring: { interval },
    lookup_key: key,
    transfer_lookup_key: true,
    tax_behavior: 'exclusive',
    metadata: { hirekit_plan: plan, hirekit_interval: interval },
  });
  return price.id;
}

/** Reads plan + interval back from a price's lookup key. */
export function planFromLookupKey(key: string | null | undefined): { plan: PaidPlan; interval: 'month' | 'year' } | null {
  const m = /^hirekit_(starter|growth|scale)_(month|year)$/.exec(key ?? '');
  return m ? { plan: m[1] as PaidPlan, interval: m[2] as 'month' | 'year' } : null;
}

/** Verifies the Stripe-Signature header (HMAC-SHA256, 5-minute tolerance). */
export function verifyWebhook(rawBody: string, header: string | null): boolean {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !header) return false;
  const parts = Object.fromEntries(
    header.split(',').map((p) => {
      const i = p.indexOf('=');
      return [p.slice(0, i), p.slice(i + 1)];
    }),
  ) as Record<string, string>;
  const t = Number(parts.t);
  if (!t || Math.abs(Date.now() / 1000 - t) > 300) return false;
  const expected = createHmac('sha256', secret).update(`${t}.${rawBody}`).digest('hex');
  const signatures = header
    .split(',')
    .filter((p) => p.startsWith('v1='))
    .map((p) => p.slice(3));
  return signatures.some((sig) => {
    const a = Buffer.from(sig, 'hex');
    const b = Buffer.from(expected, 'hex');
    return a.length === b.length && timingSafeEqual(a, b);
  });
}
