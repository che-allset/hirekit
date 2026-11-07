import { notFound } from 'next/navigation';
import { getCareers } from '@/lib/careers';
import { JobList } from '@/components/careers/JobList';
import { EmbedResizer } from '@/components/careers/EmbedResizer';
import { PoweredBy } from '@/components/careers/PoweredBy';
import { translateCareers } from '@/lib/translate';
import { getDict } from '@/i18n/server';

export const dynamic = 'force-dynamic';

/** Rendered inside the iframe that /widget.js injects into a company's website. */
export default async function EmbedJobsPage({ params, searchParams }: { params: { slug: string }; searchParams: { lang?: string } }) {
  const data = await getCareers(params.slug);
  if (!data) notFound();
  const { locale, t } = getDict(searchParams.lang);
  const { company, jobs } = await translateCareers(data.company, data.jobs, locale);
  const q = searchParams.lang ? `?lang=${locale}` : '';
  return (
    <div className="bg-transparent p-1">
      <JobList company={company} jobs={jobs} basePath={`/embed/${company.slug}`} t={t.careers} labels={t.dash} query={q} />
      <PoweredBy newTab label={t.careers.poweredBy} />
      <EmbedResizer />
    </div>
  );
}
