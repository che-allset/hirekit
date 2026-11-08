import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getDict } from '@/i18n/server';
import { AuthShell } from '../AuthShell';
import { ResetForm } from './ResetForm';

export const dynamic = 'force-dynamic';

export function generateMetadata(): Metadata {
  const { t } = getDict();
  return { title: t.auth.reset.title };
}

export default async function ResetPasswordPage({ searchParams }: { searchParams: { expired?: string } }) {
  const { locale, t } = getDict();
  const r = t.auth.reset;
  const {
    data: { user },
  } = await createClient().auth.getUser();

  return (
    <AuthShell title={r.title} sub={r.sub} caption={t.auth.sidePanel} locale={locale} languageLabel={t.nav.language}>
      {user && !searchParams.expired ? (
        <ResetForm key={locale} t={r} />
      ) : (
        <div className="space-y-4">
          <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900" role="alert">
            {r.expired}
          </p>
          <Link href="/forgot-password" className="btn-primary w-full py-3">
            {r.requestNew}
          </Link>
        </div>
      )}
    </AuthShell>
  );
}
