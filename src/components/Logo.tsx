import Link from 'next/link';
import { cn } from '@/lib/utils';

/**
 * The HireKit mark: a plug whose prongs and crossbar form an H.
 * Plug-and-play hiring, drawn as one shape.
 */
export function LogoMark({ className, inverted = false }: { className?: string; inverted?: boolean }) {
  const tile = inverted ? '#23272D' : '#FFD12E';
  const stroke = inverted ? '#FFD12E' : '#23272D';
  return (
    <svg viewBox="0 0 64 64" className={cn('h-8 w-8 flex-none', className)} aria-hidden="true">
      <rect width="64" height="64" rx="14" fill={tile} />
      <path d="M20 14v20a12 12 0 0 0 24 0V14" fill="none" stroke={stroke} strokeWidth="8" strokeLinecap="round" />
      <path d="M22 30h20" stroke={stroke} strokeWidth="7" />
      <path d="M32 46v8" stroke={stroke} strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({
  href = '/',
  className,
  tone = 'dark',
}: {
  href?: string;
  className?: string;
  tone?: 'dark' | 'light';
}) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center gap-2.5 font-display text-[26px] leading-none',
        tone === 'light' ? 'text-white' : 'text-graphite',
        className,
      )}
    >
      <LogoMark />
      <span>HireKit</span>
    </Link>
  );
}
