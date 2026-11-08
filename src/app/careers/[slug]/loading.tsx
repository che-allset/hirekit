import { JobListSkeleton } from '@/components/careers/JobListSkeleton';
import { getDict } from '@/i18n/server';

/** The first visit in a new language translates the posts, which can take a few seconds. */
export default function CareersLoading() {
  const { t } = getDict();
  return (
    <div className="min-h-screen">
      <div className="animate-pulse bg-black/[0.06]" aria-hidden="true">
        <div className="mx-auto max-w-3xl px-5 pb-16 pt-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-black/[0.07]" />
            <div className="h-4 w-32 rounded bg-black/[0.07]" />
          </div>
          <div className="mt-14 h-10 w-3/4 rounded-lg bg-black/[0.07]" />
          <div className="mt-4 h-5 w-1/2 rounded bg-black/[0.05]" />
        </div>
      </div>
      <div className="mx-auto max-w-3xl px-5 py-10">
        <JobListSkeleton label={t.loading} />
      </div>
    </div>
  );
}
