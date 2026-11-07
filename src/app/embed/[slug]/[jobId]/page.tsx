import { notFound } from 'next/navigation';
import { getPublicJob } from '@/lib/careers';
import { JobDetail } from '@/components/careers/JobDetail';
import { EmbedResizer } from '@/components/careers/EmbedResizer';
import { PoweredBy } from '@/components/careers/PoweredBy';
import { getDict } from '@/i18n/server';

export const dynamic = 'force-dynamic';

export default async function EmbedJobPage({ params, searchParams }: { params: { slug: string; jobId: string }; searchParams: { lang?: string } }) {
  const data = await getPublicJob(params.slug, params.jobId);
  if (!data) notFound();
  const { locale, t } = getDict(searchParams.lang);
  const q = searchParams.lang ? `?lang=${locale}` : '';
  return (
    <div className="p-1">
      <JobDetail company={data.company} job={data.job} backHref={`/embed/${data.company.slug}${q}`} t={t} locale={locale} />
      <PoweredBy newTab label={t.careers.poweredBy} />
      <EmbedResizer />
    </div>
  );
}
