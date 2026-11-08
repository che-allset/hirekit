'use client';

import Link from 'next/link';
import { createContext, useContext, useEffect } from 'react';
import type { Dict } from '@/i18n';
import { Logo } from '@/components/Logo';

type ErrorText = Dict['errorPage'];

/**
 * Error boundaries (error.tsx) must be client components, so they can't call getDict().
 * The root layout passes the translated texts down through this small context instead,
 * which keeps the full dictionaries out of the browser bundle.
 */
const ErrorTextContext = createContext<ErrorText | null>(null);

export function ErrorTextProvider({ text, children }: { text: ErrorText; children: React.ReactNode }) {
  return <ErrorTextContext.Provider value={text}>{children}</ErrorTextContext.Provider>;
}

const FALLBACK: ErrorText = {
  title: 'Something went wrong',
  body: 'This page didn’t load properly. It’s usually temporary: try again in a moment.',
  retry: 'Try again',
  home: 'Back to home',
  dashboard: 'Back to overview',
};

export function ErrorView({
  error,
  reset,
  inDashboard = false,
}: {
  error: Error & { digest?: string };
  reset: () => void;
  inDashboard?: boolean;
}) {
  const t = useContext(ErrorTextContext) ?? FALLBACK;

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      role="alert"
      className={
        inDashboard
          ? 'mx-auto flex max-w-lg flex-col items-center py-16 text-center'
          : 'flex min-h-screen flex-col items-center justify-center px-6 text-center'
      }
    >
      {!inDashboard && <Logo />}
      <h1 className={inDashboard ? 'font-display text-4xl tracking-tight' : 'mt-10 font-display text-5xl'}>{t.title}</h1>
      <p className="mt-3 max-w-md text-ink-soft">{t.body}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={reset} className="btn-primary">
          {t.retry}
        </button>
        <Link href={inDashboard ? '/dashboard' : '/'} className="btn-ghost">
          {inDashboard ? t.dashboard : t.home}
        </Link>
      </div>
    </div>
  );
}
