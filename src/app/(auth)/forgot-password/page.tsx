import type { Metadata } from 'next';
import { getDict } from '@/i18n/server';
import { AuthShell } from '../AuthShell';
import { ForgotForm } from './ForgotForm';

export function generateMetadata(): Metadata {
  const { t } = getDict();
  return { title: t.auth.forgot.title };
}

export default function ForgotPasswordPage() {
  const { locale, t } = getDict();
  return (
    <AuthShell title={t.auth.forgot.title} sub={t.auth.forgot.sub} caption={t.auth.sidePanel} locale={locale} languageLabel={t.nav.language}>
      <ForgotForm key={locale} t={t.auth.forgot} />
    </AuthShell>
  );
}
