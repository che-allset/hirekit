'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { DEMO_EMAIL, DEMO_PASSWORD } from '@/lib/demo';
import type { Dict } from '@/i18n';

export function LoginForm({ t }: { t: Dict['auth']['login'] }) {
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
      setError(t.wrong);
      setPending(false);
      return;
    }
    router.replace('/dashboard');
    router.refresh();
  }

  return (
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="label" htmlFor="email">{t.email}</label>
          <input id="email" name="email" type="email" required className="input" autoComplete="email" />
        </div>
        <div>
          <label className="label" htmlFor="password">{t.password}</label>
          <input id="password" name="password" type="password" required className="input" autoComplete="current-password" />
        </div>
        {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</p>}
        <button type="submit" disabled={pending} className="btn-primary w-full py-3">
          {pending ? t.submitting : t.submit}
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
          {t.demo}
        </button>
        <p className="text-center text-sm text-ink-mute">
          {t.newHere} <Link href="/signup" className="font-bold text-graphite underline">{t.create}</Link>
        </p>
      </form>
  );
}
