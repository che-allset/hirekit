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
  const next = status === 'open' ? 'closed' : 'open';
  return (
    <button
      type="button"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        await setJobStatus(id, next);
        setPending(false);
        router.refresh();
      }}
      className="btn-ghost px-3 py-1.5 text-xs"
    >
      {pending ? '…' : status === 'open' ? closeLabel : reopenLabel}
    </button>
  );
}
