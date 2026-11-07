'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const LINKS = [
  { href: '/dashboard', label: 'Overview', icon: '◐' },
  { href: '/dashboard/candidates', label: 'Candidates', icon: '◎' },
  { href: '/dashboard/ask', label: 'Ask your pipeline', icon: '✦' },
  { href: '/dashboard/jobs', label: 'Jobs', icon: '▤' },
  { href: '/dashboard/settings', label: 'Careers & widget', icon: '⌘' },
];

export function NavLinks({ horizontal = false }: { horizontal?: boolean }) {
  const pathname = usePathname();
  return (
    <nav className={cn(horizontal ? 'flex gap-1' : 'space-y-1')}>
      {LINKS.map((l) => {
        const active = l.href === '/dashboard' ? pathname === l.href : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={cn(
              'flex items-center gap-3 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium transition',
              active ? 'bg-ink text-white' : 'text-ink-soft hover:bg-paper-warm hover:text-ink',
            )}
          >
            <span className={cn('w-4 text-center', active ? 'text-lime-accent' : 'text-ink-mute')}>{l.icon}</span>
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
