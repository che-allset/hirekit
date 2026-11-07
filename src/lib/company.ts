import 'server-only';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from './supabase/server';
import { createAdminClient } from './supabase/admin';
import { slugify } from './utils';
import type { Company } from './types';

/** Creates a company with a unique slug for the given owner. */
export async function createCompanyFor(
  ownerId: string,
  name: string,
  extra: { website?: string | null; brand_color?: string } = {},
): Promise<Company> {
  const admin = createAdminClient();
  const base = slugify(name);
  for (let attempt = 0; attempt < 5; attempt++) {
    const slug = attempt === 0 ? base : `${base}-${Math.random().toString(36).slice(2, 6)}`;
    const { data, error } = await admin
      .from('companies')
      .insert({
        owner_id: ownerId,
        name,
        slug,
        ...(extra.website ? { website: extra.website } : {}),
        ...(extra.brand_color ? { brand_color: extra.brand_color } : {}),
      })
      .select('*')
      .single();
    if (!error && data) return data as Company;
    if (error && error.code !== '23505') throw new Error(error.message); // 23505 = unique violation
  }
  throw new Error('Could not create a unique company URL');
}

/** Loads the signed-in user's company or sends them to log in. */
export async function requireCompany() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data } = await supabase.from('companies').select('*').eq('owner_id', user.id).maybeSingle();
  let company = data as Company | null;

  // Accounts created outside the sign-up flow get a company on first visit.
  if (!company) {
    company = await createCompanyFor(user.id, user.email?.split('@')[1]?.split('.')[0] || 'My company');
  }

  return { supabase, user, company };
}

/** Absolute origin of the current deployment, for share links and embed code. */
export function getOrigin() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
  const h = headers();
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000';
  const proto = h.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https');
  return `${proto}://${host}`;
}
