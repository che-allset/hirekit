import Link from 'next/link';
import { Logo } from '@/components/Logo';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <Logo />
      <h1 className="mt-10 font-display text-5xl">Page not found</h1>
      <p className="mt-3 text-ink-soft">This page or job may have been closed or moved.</p>
      <Link href="/" className="btn-primary mt-8">
        Back to home
      </Link>
    </div>
  );
}
