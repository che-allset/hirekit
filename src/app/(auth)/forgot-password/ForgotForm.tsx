'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { Dict } from '@/i18n';
import { requestPasswordReset } from '../actions';

export function ForgotForm({ t }: { t: Dict['auth']['forgot'] }) {
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const res = await requestPasswordReset(String(new FormData(e.currentTarget).get('email') ?? ''));
    setPending(false);
    if (res.error) setError(res.error);
    else setSent(true);
  }

  if (sent) {
    return (
      <div className="space-y-4">
        <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800" role="status">
          {t.sent}
        </p>
        <Link href="/login" className="btn-ghost w-full">
          {t.back}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="label" htmlFor="email">
          {t.email}
        </label>
        <input id="email" name="email" type="email" required className="input" autoComplete="email" />
      </div>
      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn-primary w-full py-3">
        {pending ? t.submitting : t.submit}
      </button>
      <p className="text-center text-sm">
        <Link href="/login" className="font-bold text-graphite underline">
          {t.back}
        </Link>
      </p>
    </form>
  );
}
