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
  errorLabel,
}: {
  id: string;
  stage: Stage;
  compact?: boolean;
  labels: Record<Stage, string>;
  ariaLabel: string;
  errorLabel: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [value, setValue] = useState<Stage>(stage);
  const [failed, setFailed] = useState(false);
  return (
    <span className="inline-flex flex-col items-start gap-1">
    <select
      aria-label={ariaLabel}
      value={value}
      disabled={pending}
      onClick={(e) => e.stopPropagation()}
      onChange={async (e) => {
        const previous = value;
        const next = e.target.value as Stage;
        setValue(next);
        setPending(true);
        setFailed(false);
        let ok = false;
        try {
          ok = !(await setStage(id, next))?.error;
        } catch {
          ok = false;
        } finally {
          setPending(false);
        }
        if (!ok) {
          // Show the stage that is really saved, not the one that failed.
          setValue(previous);
          setFailed(true);
          return;
        }
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
    {failed && (
      <span role="alert" className="max-w-[220px] text-xs text-rose-700">
        {errorLabel}
      </span>
    )}
    </span>
  );
}
