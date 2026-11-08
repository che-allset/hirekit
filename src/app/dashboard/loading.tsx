import { getDict } from '@/i18n/server';

/** Shown inside the dashboard (menu stays visible) while a page loads. */
export default function DashboardLoading() {
  const { t } = getDict();
  return (
    <div role="status" aria-live="polite" className="animate-pulse">
      <span className="sr-only">{t.loading}</span>
      <div aria-hidden="true">
        <div className="mb-8">
          <div className="h-9 w-56 rounded-lg bg-black/[0.06]" />
          <div className="mt-3 h-4 w-80 max-w-full rounded bg-black/[0.04]" />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="card h-24 p-5">
              <div className="h-3 w-20 rounded bg-black/[0.06]" />
              <div className="mt-4 h-6 w-12 rounded bg-black/[0.06]" />
            </div>
          ))}
        </div>
        <div className="card mt-6 space-y-4 p-6">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-9 w-9 flex-none rounded-full bg-black/[0.06]" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-1/3 rounded bg-black/[0.06]" />
                <div className="h-3 w-1/2 rounded bg-black/[0.04]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
