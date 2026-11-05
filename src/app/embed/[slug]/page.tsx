import { notFound } from 'next/navigation';
import { getCareers } from '@/lib/careers';
import { JobList } from '@/components/careers/JobList';
import { EmbedResizer } from '@/components/careers/EmbedResizer';
import { PoweredBy } from '@/components/careers/PoweredBy';

export const dynamic = 'force-dynamic';

/** Rendered inside the iframe that /widget.js injects into a company's website. */
export default async function EmbedJobsPage({ params }: { params: { slug: string } }) {
  const data = await getCareers(params.slug);
  if (!data) notFound();
  return (
    <div className="bg-transparent p-1">
      <JobList company={data.company} jobs={data.jobs} basePath={`/embed/${data.company.slug}`} />
      <PoweredBy newTab />
      <EmbedResizer />
    </div>
  );
}
