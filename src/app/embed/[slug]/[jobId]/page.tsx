import { notFound } from 'next/navigation';
import { getPublicJob } from '@/lib/careers';
import { JobDetail } from '@/components/careers/JobDetail';
import { EmbedResizer } from '@/components/careers/EmbedResizer';
import { PoweredBy } from '@/components/careers/PoweredBy';

export const dynamic = 'force-dynamic';

export default async function EmbedJobPage({ params }: { params: { slug: string; jobId: string } }) {
  const data = await getPublicJob(params.slug, params.jobId);
  if (!data) notFound();
  return (
    <div className="p-1">
      <JobDetail company={data.company} job={data.job} backHref={`/embed/${data.company.slug}`} />
      <PoweredBy newTab />
      <EmbedResizer />
    </div>
  );
}
