import Link from 'next/link';
import type { Company, Job } from '@/lib/types';
import { ApplyForm } from './ApplyForm';
import { RichText } from './RichText';
import { fmt, type Dict, type Locale } from '@/i18n';

export function JobDetail({ company, job, backHref, t, locale }: { company: Company; job: Job; backHref: string; t: Dict; locale: Locale }) {
  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_420px]">
      <article>
        <Link href={backHref} className="text-sm text-ink-mute hover:text-ink">
          {fmt(t.careers.allRoles, { company: company.name })}
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
            <h2 className="mb-3 font-bold">{t.careers.lookingFor}</h2>
            <RichText text={job.requirements} />
          </div>
        )}
      </article>

      <aside className="lg:sticky lg:top-6 lg:self-start">
        <div className="card p-6">
          <h2 className="text-lg font-bold">{t.careers.applyTitle}</h2>
          <p className="mb-5 mt-1 text-sm text-ink-mute">{t.careers.applySub}</p>
          <ApplyForm jobId={job.id} jobTitle={job.title} companyName={company.name} brandColor={company.brand_color} t={t.apply} locale={locale} />
        </div>
      </aside>
    </div>
  );
}
