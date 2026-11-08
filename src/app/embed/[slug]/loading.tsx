import { JobListSkeleton } from '@/components/careers/JobListSkeleton';
import { getDict } from '@/i18n/server';

/** Placeholder inside the website widget while the job posts load or translate. */
export default function EmbedLoading() {
  const { t } = getDict();
  return (
    <div className="bg-transparent p-1">
      <JobListSkeleton label={t.loading} />
    </div>
  );
}
