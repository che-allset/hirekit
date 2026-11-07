import { getDict } from '@/i18n/server';
import { AuthShell } from '../AuthShell';
import { LoginForm } from './LoginForm';

export default function LoginPage() {
  const { locale, t } = getDict();
  return (
    <AuthShell title={t.auth.login.title} sub={t.auth.login.sub} caption={t.auth.sidePanel} locale={locale} languageLabel={t.nav.language}>
      <LoginForm key={locale} t={t.auth.login} />
    </AuthShell>
  );
}
