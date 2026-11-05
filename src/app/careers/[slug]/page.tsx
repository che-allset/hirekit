import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCareers } from '@/lib/careers';
import { CompanyBadge } from '@/components/careers/CompanyBadge';
import { JobList } from '@/components/careers/JobList';
import { PoweredBy } from '@/components/careers/PoweredBy';
import { safeUrl } from '@/lib/utils';

export const dynamic = 'force-dynamic';

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getCareers(params.slug);
  if (!data) return { title: 'Careers' };
  return {
    title: `Careers at ${data.company.name}`,
    description: data.company.tagline ?? `Open roles at ${data.company.name}`,
  };
}

export default async function CareersPage({ params }: Props) {
  const data = await getCareers(params.slug);
  if (!data) notFound();
  const { company, jobs } = data;
  const website = safeUrl(company.website);

  return (
    <div className="min-h-screen">
      <header className="relative overflow-hidden text-white" style={{ backgroundColor: company.brand_color }}>
        <div className="bg-grid absolute inset-0 opacity-20" />
        <div className="relative mx-auto max-w-3xl px-5 pb-16 pt-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="rounded-2xl bg-white/15 p-1">
                <CompanyBadge company={company} />
              </span>
              <span className="font-semibold">{company.name}</span>
            </div>
            {website && (
              <a href={website} className="text-sm text-white/80 hover:text-white" target="_blank" rel="noreferrer">
                Website ↗
              </a>
            )}
          </div>
          <h1 className="mt-14 font-display text-5xl leading-tight md:text-6xl">Join {company.name}</h1>
          {company.tagline && <p className="mt-3 max-w-xl text-lg text-white/85">{company.tagline}</p>}
          <p className="mt-6 text-sm text-white/70">
            {jobs.length} open {jobs.length === 1 ? 'role' : 'roles'}
          </p>
        </div>
      </header>

      <main className="mx-auto -mt-8 max-w-3xl px-5 pb-16">
        <div className="rounded-3xl bg-paper p-1">
          <JobList company={company} jobs={jobs} basePath={`/careers/${company.slug}`} />
        </div>
        <PoweredBy />
      </main>
    </div>
  );
}
