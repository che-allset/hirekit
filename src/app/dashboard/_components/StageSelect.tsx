'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { STAGES, type Stage } from '@/lib/types';
import { cn } from '@/lib/utils';
import { setStage } from '../actions';

export function StageSelect({
  id,
  stage,
  compact = false,
  labels,
  ariaLabel,
}: {
  id: string;
  stage: Stage;
  compact?: boolean;
  labels: Record<Stage, string>;
  ariaLabel: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [value, setValue] = useState<Stage>(stage);
  return (
    <select
      aria-label={ariaLabel}
      value={value}
      disabled={pending}
      onClick={(e) => e.stopPropagation()}
      onChange={async (e) => {
        const next = e.target.value as Stage;
        setValue(next);
        setPending(true);
        await setStage(id, next);
        setPending(false);
        router.refresh();
      }}
      className={cn(
        'rounded-lg border border-black/10 bg-white font-medium text-ink focus:outline-none focus:ring-2 focus:ring-brand-200',
        compact ? 'px-2 py-1 text-xs' : 'px-3 py-2 text-sm',
        pending && 'opacity-60',
      )}
    >
      {STAGES.map((s) => (
        <option key={s.key} value={s.key}>
          {labels[s.key]}
        </option>
      ))}
    </select>
  );
}
