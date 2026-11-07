import { getDict } from '@/i18n/server';
import { SignupForm } from './SignupForm';

export default function SignupPage() {
  const { locale, t } = getDict();
  return <SignupForm key={locale} t={t.auth.signup} locale={locale} languageLabel={t.nav.language} />;
}
