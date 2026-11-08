'use client';

import { useRouter } from 'next/navigation';
import { LOCALES, LOCALE_COOKIE, type Locale } from '@/i18n';
import { LANGUAGE_NAMES } from '@/i18n/names';
import { cn } from '@/lib/utils';

export function LanguageSwitcher({
  locale,
  label,
  tone = 'light',
  className,
}: {
  locale: Locale;
  label: string;
  tone?: 'light' | 'dark';
  className?: string;
}) {
  const router = useRouter();
  return (
    <label className={cn('relative inline-flex items-center', className)}>
      <span className="sr-only">{label}</span>
      <svg viewBox="0 0 24 24" className={cn('pointer-events-none absolute left-2.5 h-4 w-4', tone === 'dark' ? 'text-white/70' : 'text-graphite-600')} aria-hidden="true">
        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z" fill="none" stroke="currentColor" strokeWidth="1.8" />
      </svg>
      <select
        value={locale}
        onChange={(e) => {
          document.cookie = `${LOCALE_COOKIE}=${e.target.value}; path=/; max-age=31536000; samesite=lax`;
          router.refresh();
        }}
        className={cn(
          'cursor-pointer appearance-none rounded-[10px] border py-2 pl-8 pr-3 text-sm font-bold',
          tone === 'dark' ? 'border-white/20 bg-transparent text-white' : 'border-graphite/15 bg-white text-graphite',
        )}
      >
        {LOCALES.map((l: Locale) => (
          <option key={l} value={l} className="text-graphite">
            {LANGUAGE_NAMES[l]}
          </option>
        ))}
      </select>
    </label>
  );
}
