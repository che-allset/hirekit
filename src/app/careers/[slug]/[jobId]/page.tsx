import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPublicJob } from '@/lib/careers';
import { CompanyBadge } from '@/components/careers/CompanyBadge';
import { JobDetail } from '@/components/careers/JobDetail';
import { PoweredBy } from '@/components/careers/PoweredBy';

export const dynamic = 'force-dynamic';

type Props = { params: { slug: string; jobId: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getPublicJob(params.slug, params.jobId);
  if (!data) return { title: 'Job not found' };
  return { title: `${data.job.title} · ${data.company.name}` };
}

export default async function PublicJobPage({ params }: Props) {
  const data = await getPublicJob(params.slug, params.jobId);
  if (!data) notFound();
  const { company, job } = data;

  // Google for Jobs structured data, so roles can appear in Google's job search.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.description.replace(/\n/g, '<br>'),
    datePosted: job.created_at,
    employmentType: job.employment_type.toUpperCase().replace('-', '_'),
    hiringOrganization: { '@type': 'Organization', name: company.name, sameAs: company.website ?? undefined },
    ...(job.work_mode === 'Remote'
      ? { jobLocationType: 'TELECOMMUTE', applicantLocationRequirements: { '@type': 'Country', name: 'EU' } }
      : { jobLocation: { '@type': 'Place', address: { '@type': 'PostalAddress', addressLocality: job.location ?? '' } } }),
  };

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <header className="border-b border-black/5 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-5">
          <Link href={`/careers/${company.slug}`} className="flex items-center gap-3 font-semibold">
            <CompanyBadge company={company} />
            {company.name}
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-10">
        <JobDetail company={company} job={job} backHref={`/careers/${company.slug}`} />
        <PoweredBy />
      </main>
    </div>
  );
}
