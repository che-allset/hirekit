'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { setJobStatus } from '../actions';

export function JobStatusToggle({
  id,
  status,
  closeLabel,
  reopenLabel,
}: {
  id: string;
  status: 'open' | 'closed';
  closeLabel: string;
  reopenLabel: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const next = status === 'open' ? 'closed' : 'open';
  return (
    <span className="inline-flex flex-col items-end gap-1">
    <button
      type="button"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        setError(null);
        const res = await setJobStatus(id, next);
        setPending(false);
        if (res?.error) setError(res.error);
        else router.refresh();
      }}
      className="btn-ghost px-3 py-1.5 text-xs"
    >
      {pending ? '…' : status === 'open' ? closeLabel : reopenLabel}
    </button>
    {error && (
      <span role="alert" className="max-w-[260px] text-right text-xs text-rose-700">
        {error}
      </span>
    )}
    </span>
  );
}
