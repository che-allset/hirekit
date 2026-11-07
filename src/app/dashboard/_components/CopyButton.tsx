'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

export function CopyButton({ value, label, copiedLabel, className }: { value: string; label: string; copiedLabel: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        } catch {
          /* clipboard unavailable */
        }
      }}
      className={cn('btn-ghost px-3 py-1.5 text-xs', className)}
    >
      {copied ? copiedLabel : label}
    </button>
  );
}
