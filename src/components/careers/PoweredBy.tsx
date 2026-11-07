import Link from 'next/link';
import { LogoMark } from '@/components/Logo';

export function PoweredBy({ newTab = false, label }: { newTab?: boolean; label: string }) {
  return (
    <p className="mt-12 flex items-center justify-center gap-1.5 text-xs text-ink-mute">
      {label}
      <Link
        href="/"
        target={newTab ? '_blank' : undefined}
        className="inline-flex items-center gap-1 font-semibold text-ink hover:underline"
      >
        <LogoMark className="h-4 w-4" /> HireKit
      </Link>
    </p>
  );
}
