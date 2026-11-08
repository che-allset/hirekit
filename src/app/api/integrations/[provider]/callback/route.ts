import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { getOrigin } from '@/lib/company';
import { connect, isProvider } from '@/lib/integrations';
import { verify } from '@/lib/crypto';

export const dynamic = 'force-dynamic';

/** OAuth callback: checks state, stores the encrypted tokens, returns to Settings. */
export async function GET(req: Request, { params }: { params: { provider: string } }) {
  const origin = getOrigin();
  const back = (q: string) => {
    const res = NextResponse.redirect(`${origin}/dashboard/settings?${q}#integrations`);
    res.cookies.set('hk_oauth', '', { path: '/api/integrations', maxAge: 0 });
    return res;
  };
  const url = new URL(req.url);
  if (!isProvider(params.provider)) return back('integration_error=unknown');
  if (url.searchParams.get('error')) return back(`integration_error=denied&provider=${params.provider}`);

  const state = verify(url.searchParams.get('state'));
  const nonce = cookies().get('hk_oauth')?.value;
  if (!state || state.p !== params.provider || !nonce || state.n !== nonce) return back('integration_error=state');

  // The signed-in user must own the company the flow was started for.
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(`${origin}/login`);
  const { data: company } = await supabase.from('companies').select('id').eq('owner_id', user.id).maybeSingle();
  if (!company || company.id !== state.c) return back('integration_error=state');

  const code = url.searchParams.get('code');
  if (!code) return back('integration_error=denied');
  try {
    await connect(company.id, params.provider, code, `${origin}/api/integrations/${params.provider}/callback`);
  } catch (err) {
    console.error('Integration connect failed', err);
    return back(`integration_error=failed&provider=${params.provider}`);
  }
  return back(`connected=${params.provider}`);
}
