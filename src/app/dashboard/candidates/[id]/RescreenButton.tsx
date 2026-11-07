'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { rescreen } from '../../actions';

export function RescreenButton({ id, label, runningLabel }: { id: string; label: string; runningLabel: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <div className="flex items-center gap-3">
      {error && <span className="text-xs text-red-600">{error}</span>}
      <button
        type="button"
        disabled={pending}
        onClick={async () => {
          setPending(true);
          setError(null);
          const res = await rescreen(id);
          setPending(false);
          if (res.error) setError(res.error);
          router.refresh();
        }}
        className="btn-ghost px-3 py-1.5 text-xs"
      >
        {pending ? runningLabel : label}
      </button>
    </div>
  );
}
