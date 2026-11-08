import type { Metadata } from 'next';
import { getDict } from '@/i18n/server';
import { SignupForm } from './SignupForm';

export function generateMetadata(): Metadata {
  const { t } = getDict();
  return { title: t.meta.signup };
}

export default function SignupPage() {
  const { locale, t } = getDict();
  return <SignupForm key={locale} t={t.auth.signup} locale={locale} languageLabel={t.nav.language} />;
}
