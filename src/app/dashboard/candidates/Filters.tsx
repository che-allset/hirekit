'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { STAGES } from '@/lib/types';
import type { Dict } from '@/i18n';

export function Filters({ jobs, t }: { jobs: { id: string; title: string }[]; t: Dict['dash'] }) {
  const c = t.candidates;
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get('q') ?? '');

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.replace(`${pathname}?${next.toString()}`);
  };

  // Debounced search
  useEffect(() => {
    const current = params.get('q') ?? '';
    if (q === current) return;
    const t = setTimeout(() => update('q', q.trim()), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const hasFilters = ['job', 'verdict', 'stage', 'q'].some((k) => params.get(k));

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={c.search}
        className="input w-full sm:w-56"
        aria-label={c.search}
      />
      <select className="input w-auto" value={params.get('job') ?? ''} onChange={(e) => update('job', e.target.value)} aria-label={c.allRoles}>
        <option value="">{c.allRoles}</option>
        {jobs.map((j) => (
          <option key={j.id} value={j.id}>
            {j.title}
          </option>
        ))}
      </select>
      <select className="input w-auto" value={params.get('verdict') ?? ''} onChange={(e) => update('verdict', e.target.value)} aria-label={c.anyFit}>
        <option value="">{c.anyFit}</option>
        <option value="strong">{c.strongFit}</option>
        <option value="possible">{c.possibleFit}</option>
        <option value="weak">{c.weakFit}</option>
      </select>
      <select className="input w-auto" value={params.get('stage') ?? ''} onChange={(e) => update('stage', e.target.value)} aria-label={c.allStages}>
        <option value="">{c.allStages}</option>
        {STAGES.map((s) => (
          <option key={s.key} value={s.key}>
            {t.stages[s.key]}
          </option>
        ))}
      </select>
      {hasFilters && (
        <button
          type="button"
          onClick={() => {
            setQ('');
            const view = params.get('view');
            router.replace(view ? `${pathname}?view=${view}` : pathname);
          }}
          className="px-2 text-sm text-ink-mute underline hover:text-ink"
        >
          {c.clear}
        </button>
      )}
    </div>
  );
}
