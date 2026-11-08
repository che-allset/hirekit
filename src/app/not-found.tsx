import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { getDict } from '@/i18n/server';

export default function NotFound() {
  const { t } = getDict();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <Logo />
      <h1 className="mt-10 font-display text-5xl">{t.notFound.title}</h1>
      <p className="mt-3 text-ink-soft">{t.notFound.body}</p>
      <Link href="/" className="btn-primary mt-8">
        {t.notFound.home}
      </Link>
    </div>
  );
}
