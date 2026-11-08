'use client';

import { ErrorView } from '@/components/ErrorView';

/** Keeps the dashboard menu on screen when a page fails, with a retry button. */
export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <ErrorView error={error} reset={reset} inDashboard />;
}
