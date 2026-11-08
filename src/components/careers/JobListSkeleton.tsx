/** Grey placeholder in the shape of the job list, shown while job posts load or translate. */
export function JobListSkeleton({ label }: { label: string }) {
  return (
    <div role="status" aria-live="polite" className="animate-pulse">
      <span className="sr-only">{label}</span>
      <div aria-hidden="true">
        <div className="mb-3 h-3 w-24 rounded bg-black/[0.06]" />
        <ul className="space-y-3">
          {[0, 1, 2].map((i) => (
            <li key={i} className="flex items-center justify-between gap-4 rounded-2xl border border-black/[0.06] bg-white p-5 shadow-sm">
              <div className="min-w-0 flex-1">
                <div className="h-4 w-1/2 rounded bg-black/[0.07]" />
                <div className="mt-3 flex gap-2">
                  <div className="h-5 w-16 rounded-full bg-black/[0.05]" />
                  <div className="h-5 w-16 rounded-full bg-black/[0.05]" />
                  <div className="h-5 w-20 rounded-full bg-black/[0.05]" />
                </div>
              </div>
              <div className="h-9 w-9 flex-none rounded-full bg-black/[0.07]" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
