import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { createClient } from '@/lib/supabase/server';
import { getOrigin } from '@/lib/company';
import { authorizeUrl, isConfigured, isProvider } from '@/lib/integrations';
import { sign } from '@/lib/crypto';
import { DEMO_SLUG } from '@/lib/demo';

export const dynamic = 'force-dynamic';

/** Starts the OAuth flow for Google, Microsoft or Zoom. */
export async function GET(_req: Request, { params }: { params: { provider: string } }) {
  const origin = getOrigin();
  const back = (q: string) => NextResponse.redirect(`${origin}/dashboard/settings?${q}#integrations`);
  if (!isProvider(params.provider)) return back('integration_error=unknown');
  if (!isConfigured(params.provider)) return back(`integration_error=not_configured&provider=${params.provider}`);

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(`${origin}/login`);
  const { data: company } = await supabase.from('companies').select('id, slug').eq('owner_id', user.id).maybeSingle();
  if (!company) return back('integration_error=unknown');
  // The demo workspace is shared by everyone: never attach a real calendar to it.
  if (company.slug === DEMO_SLUG) return back('integration_error=demo');

  const nonce = randomBytes(16).toString('base64url');
  const state = sign({ c: company.id, p: params.provider, n: nonce });
  const redirectUri = `${origin}/api/integrations/${params.provider}/callback`;
  const res = NextResponse.redirect(authorizeUrl(params.provider, redirectUri, state));
  res.cookies.set('hk_oauth', nonce, { httpOnly: true, secure: true, sameSite: 'lax', path: '/api/integrations', maxAge: 600 });
  return res;
}
