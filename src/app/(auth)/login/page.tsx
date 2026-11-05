'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { AuthShell } from '../AuthShell';
import { DEMO_EMAIL, DEMO_PASSWORD } from '@/lib/demo';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const f = new FormData(e.currentTarget);
    const { error } = await createClient().auth.signInWithPassword({
      email: String(f.get('email') ?? '').trim(),
      password: String(f.get('password') ?? ''),
    });
    if (error) {
      setError('Wrong email or password.');
      setPending(false);
      return;
    }
    router.replace('/dashboard');
    router.refresh();
  }

  return (
    <AuthShell title="Welcome back" sub="Log in to review candidates and manage your roles.">
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required className="input" autoComplete="email" />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input id="password" name="password" type="password" required className="input" autoComplete="current-password" />
        </div>
        {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</p>}
        <button type="submit" disabled={pending} className="btn-primary w-full py-3">
          {pending ? 'Logging in…' : 'Log in'}
        </button>
        <button
          type="button"
          onClick={(e) => {
            const form = e.currentTarget.form;
            if (!form) return;
            (form.elements.namedItem('email') as HTMLInputElement).value = DEMO_EMAIL;
            (form.elements.namedItem('password') as HTMLInputElement).value = DEMO_PASSWORD;
            form.requestSubmit();
          }}
          className="btn-ghost w-full"
        >
          Explore the demo workspace
        </button>
        <p className="text-center text-sm text-ink-mute">
          New to HireKit? <Link href="/signup" className="font-medium text-ink underline">Create an account</Link>
        </p>
      </form>
    </AuthShell>
  );
}
