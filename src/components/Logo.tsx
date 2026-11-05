import Link from 'next/link';
import { cn } from '@/lib/utils';

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn('h-7 w-7', className)} aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="#0E1116" />
      <path d="M10 9v14M22 9v14M10 16h7" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
      <circle cx="22" cy="16" r="3.2" fill="#D4F25A" />
    </svg>
  );
}

export function Logo({ href = '/', className }: { href?: string; className?: string }) {
  return (
    <Link href={href} className={cn('inline-flex items-center gap-2 font-semibold tracking-tight', className)}>
      <LogoMark />
      <span className="text-lg">HireKit</span>
    </Link>
  );
}
