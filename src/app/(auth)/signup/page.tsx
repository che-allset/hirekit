'use client';

import Link from 'next/link';
import { useState } from 'react';
import { AuthShell } from '../AuthShell';
import { signUp } from '../actions';

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const f = new FormData(e.currentTarget);
    const res = await signUp({
      companyName: String(f.get('company') ?? ''),
      email: String(f.get('email') ?? ''),
      password: String(f.get('password') ?? ''),
    });
    // On success the action redirects; we only get here on error.
    if (res?.error) setError(res.error);
    setPending(false);
  }

  return (
    <AuthShell title="Start hiring" sub="Create your company's hiring page in under five minutes.">
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="label" htmlFor="company">Company name</label>
          <input id="company" name="company" required className="input" placeholder="Acme GmbH" autoComplete="organization" />
        </div>
        <div>
          <label className="label" htmlFor="email">Work email</label>
          <input id="email" name="email" type="email" required className="input" autoComplete="email" />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input id="password" name="password" type="password" required minLength={8} className="input" autoComplete="new-password" />
        </div>
        {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</p>}
        <button type="submit" disabled={pending} className="btn-primary w-full py-3">
          {pending ? 'Setting up your workspace…' : 'Create account'}
        </button>
        <p className="text-center text-sm text-ink-mute">
          Already have an account? <Link href="/login" className="font-medium text-ink underline">Log in</Link>
        </p>
      </form>
    </AuthShell>
  );
}
