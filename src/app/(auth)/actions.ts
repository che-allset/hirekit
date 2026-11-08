'use server';

import { redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { createCompanyFor } from '@/lib/company';
import { isEmail, isHexColor, safeUrl } from '@/lib/utils';

export async function signUp(input: {
  companyName: string;
  email: string;
  password: string;
  website?: string;
  brandColor?: string;
}) {
  const companyName = input.companyName.trim().slice(0, 80);
  const email = input.email.trim().toLowerCase();
  const password = input.password;

  if (companyName.length < 2) return { error: 'Please enter your company name.' };
  if (!isEmail(email)) return { error: 'Please enter a valid work email.' };
  if (password.length < 8) return { error: 'Use at least 8 characters for your password.' };

  // Created server-side and pre-confirmed so new companies can start immediately.
  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  if (error || !data.user) {
    const msg = error?.message ?? '';
    if (/already|registered|exists/i.test(msg)) return { error: 'An account with this email already exists. Try logging in.' };
    return { error: 'We could not create your account. Please try again.' };
  }

  try {
    await createCompanyFor(data.user.id, companyName, {
      website: safeUrl(input.website),
      brand_color: input.brandColor && isHexColor(input.brandColor) ? input.brandColor : undefined,
    });
  } catch {
    await admin.auth.admin.deleteUser(data.user.id);
    return { error: 'We could not set up your company. Please try again.' };
  }

  const supabase = createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
  if (signInError) redirect('/login');

  redirect('/dashboard?welcome=1');
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

// ───────────────────────── Password reset ─────────────────────────

const resetAttempts = new Map<string, number[]>();

/**
 * Emails a one-time reset link (our own branded email, in the user's language).
 * Always answers the same way, so nobody can find out which emails have accounts.
 */
export async function requestPasswordReset(emailRaw: string): Promise<{ ok?: boolean; error?: string }> {
  const { getLocale } = await import('@/i18n/server');
  const { DICTS } = await import('@/i18n');
  const { isEmailConfigured, renderEmail, sendEmail } = await import('@/lib/email');
  const { DEMO_EMAIL } = await import('@/lib/demo');
  const { getOrigin } = await import('@/lib/company');
  const locale = getLocale();
  const t = DICTS[locale].auth.forgot;
  const email = emailRaw.trim().toLowerCase();
  if (!isEmail(email)) return { error: t.invalid };
  if (!isEmailConfigured()) return { error: t.notConfigured };

  // Light rate limit: 3 requests per email per 15 minutes (per server instance).
  const now = Date.now();
  const recent = (resetAttempts.get(email) ?? []).filter((ts) => now - ts < 15 * 60_000);
  if (recent.length >= 3) return { ok: true };
  resetAttempts.set(email, [...recent, now]);

  // The shared demo account's password must never change.
  if (email === DEMO_EMAIL) return { ok: true };

  try {
    const { data, error } = await createAdminClient().auth.admin.generateLink({ type: 'recovery', email });
    const tokenHash = data?.properties?.hashed_token;
    if (error || !tokenHash) return { ok: true }; // unknown email: same answer
    const link = `${getOrigin()}/auth/confirm?token_hash=${encodeURIComponent(tokenHash)}&type=recovery&next=/reset-password`;
    const e = DICTS[locale].emails.reset;
    const { html, text } = renderEmail({
      preheader: e.subject,
      heading: e.heading,
      paragraphs: [e.body, e.ignore],
      button: { label: e.button, url: link },
      footer: e.footer,
    });
    await sendEmail({ to: email, subject: e.subject, html, text });
  } catch (err) {
    console.error('Password reset failed', err);
  }
  return { ok: true };
}

/** Sets a new password for the user signed in through the reset link. */
export async function updatePassword(password: string): Promise<{ error?: string }> {
  const { getLocale } = await import('@/i18n/server');
  const { DICTS } = await import('@/i18n');
  const { DEMO_EMAIL } = await import('@/lib/demo');
  const t = DICTS[getLocale()].auth.reset;
  if (password.length < 8) return { error: t.short };
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: t.expired };
  if (user.email?.toLowerCase() === DEMO_EMAIL) return { error: t.demo };
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: t.failed };
  redirect('/dashboard');
}
