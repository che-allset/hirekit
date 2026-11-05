import Link from 'next/link';
import type { Company, Job } from '@/lib/types';
import { ApplyForm } from './ApplyForm';
import { RichText } from './RichText';

export function JobDetail({ company, job, backHref }: { company: Company; job: Job; backHref: string }) {
  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_420px]">
      <article>
        <Link href={backHref} className="text-sm text-ink-mute hover:text-ink">
          ← All roles at {company.name}
        </Link>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">{job.title}</h1>
        <div className="mt-4 flex flex-wrap gap-2 text-sm text-ink-soft">
          {job.department && <span className="rounded-full bg-paper-warm px-3 py-1">{job.department}</span>}
          {job.location && <span className="rounded-full bg-paper-warm px-3 py-1">{job.location}</span>}
          <span className="rounded-full bg-paper-warm px-3 py-1">{job.work_mode}</span>
          <span className="rounded-full bg-paper-warm px-3 py-1">{job.employment_type}</span>
          {job.salary_range && <span className="rounded-full bg-paper-warm px-3 py-1">{job.salary_range}</span>}
        </div>

        <div className="mt-8">
          <RichText text={job.description} />
        </div>

        {job.requirements && (
          <div className="mt-8">
            <h2 className="mb-3 font-semibold">What we are looking for</h2>
            <RichText text={job.requirements} />
          </div>
        )}
      </article>

      <aside className="lg:sticky lg:top-6 lg:self-start">
        <div className="card p-6">
          <h2 className="text-lg font-semibold">Apply for this role</h2>
          <p className="mb-5 mt-1 text-sm text-ink-mute">Takes about two minutes.</p>
          <ApplyForm jobId={job.id} jobTitle={job.title} companyName={company.name} brandColor={company.brand_color} />
        </div>
      </aside>
    </div>
  );
}
