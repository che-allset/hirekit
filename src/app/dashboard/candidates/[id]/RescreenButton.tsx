'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { rescreen } from '../../actions';

export function RescreenButton({
  id,
  label,
  runningLabel,
  errorLabel,
}: {
  id: string;
  label: string;
  runningLabel: string;
  errorLabel: string;
}) {
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
          try {
            const res = await rescreen(id);
            if (res.error) setError(res.error);
            router.refresh();
          } catch {
            setError(errorLabel);
          } finally {
            setPending(false);
          }
        }}
        className="btn-ghost px-3 py-1.5 text-xs"
      >
        {pending ? runningLabel : label}
      </button>
    </div>
  );
}
