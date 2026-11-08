'use client';

import { useState } from 'react';
import type { Dict } from '@/i18n';
import { updatePassword } from '../actions';

export function ResetForm({ t }: { t: Dict['auth']['reset'] }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const password = String(f.get('password') ?? '');
    if (password !== String(f.get('confirm') ?? '')) return setError(t.mismatch);
    setPending(true);
    setError(null);
    try {
      const res = await updatePassword(password);
      // On success the action redirects to the dashboard.
      if (res?.error) {
        setError(res.error);
        setPending(false);
      }
    } catch (err) {
      // A redirect after a successful reset is not an error.
      if ((err as { digest?: string })?.digest?.startsWith('NEXT_REDIRECT')) throw err;
      setError(t.failed);
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="label" htmlFor="password">
          {t.password}
        </label>
        <input id="password" name="password" type="password" required minLength={8} className="input" autoComplete="new-password" />
      </div>
      <div>
        <label className="label" htmlFor="confirm">
          {t.confirm}
        </label>
        <input id="confirm" name="confirm" type="password" required minLength={8} className="input" autoComplete="new-password" />
      </div>
      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn-primary w-full py-3">
        {pending ? t.submitting : t.submit}
      </button>
    </form>
  );
}
