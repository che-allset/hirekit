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
