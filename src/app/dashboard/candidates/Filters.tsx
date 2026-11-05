'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { STAGES } from '@/lib/types';

export function Filters({ jobs }: { jobs: { id: string; title: string }[] }) {
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
        placeholder="Search name or email"
        className="input w-full sm:w-56"
        aria-label="Search candidates"
      />
      <select className="input w-auto" value={params.get('job') ?? ''} onChange={(e) => update('job', e.target.value)} aria-label="Filter by job">
        <option value="">All roles</option>
        {jobs.map((j) => (
          <option key={j.id} value={j.id}>
            {j.title}
          </option>
        ))}
      </select>
      <select className="input w-auto" value={params.get('verdict') ?? ''} onChange={(e) => update('verdict', e.target.value)} aria-label="Filter by AI fit">
        <option value="">Any AI fit</option>
        <option value="strong">Strong (80+)</option>
        <option value="possible">Possible (55–79)</option>
        <option value="weak">Weak (&lt;55)</option>
      </select>
      <select className="input w-auto" value={params.get('stage') ?? ''} onChange={(e) => update('stage', e.target.value)} aria-label="Filter by stage">
        <option value="">All stages</option>
        {STAGES.map((s) => (
          <option key={s.key} value={s.key}>
            {s.label}
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
          Clear
        </button>
      )}
    </div>
  );
}
