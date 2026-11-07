import Link from 'next/link';
import { requireCompany } from '@/lib/company';
import type { Job } from '@/lib/types';
import { timeAgo } from '@/lib/utils';
import { EmptyState, PageHeader } from '../_components/ui';
import { JobStatusToggle } from './JobStatusToggle';
import { getDict } from '@/i18n/server';
import { fmt } from '@/i18n';

export default async function JobsPage() {
  const { supabase, company } = await requireCompany();
  const { locale, t } = getDict();
  const j = t.dash.jobs;
  const [{ data: jobsData }, { data: counts }] = await Promise.all([
    supabase.from('jobs').select('*').eq('company_id', company.id).order('created_at', { ascending: false }),
    supabase.from('applications').select('job_id').eq('company_id', company.id),
  ]);
  const jobs = (jobsData ?? []) as Job[];
  const countFor = (id: string) => (counts ?? []).filter((r: { job_id: string }) => r.job_id === id).length;

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title={j.title}
        sub={j.sub}
        action={
          <Link href="/dashboard/jobs/new" className="btn-primary">
            {t.dash.newJob}
          </Link>
        }
      />

      {jobs.length === 0 ? (
        <EmptyState
          title={j.emptyTitle}
          body={j.emptyBody}
          action={
            <Link href="/dashboard/jobs/new" className="btn-primary">
              {j.create}
            </Link>
          }
        />
      ) : (
        <ul className="space-y-3">
          {jobs.map((job) => (
            <li key={job.id} className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Link href={`/dashboard/jobs/${job.id}`} className="truncate font-semibold hover:underline">
                    {job.title}
                  </Link>
                  <span
                    className={
                      job.status === 'open' ? 'chip bg-emerald-50 text-emerald-700' : 'chip bg-black/5 text-ink-mute'
                    }
                  >
                    {job.status === 'open' ? t.dash.open : t.dash.closed}
                  </span>
                </div>
                <p className="mt-1 text-sm text-ink-mute">
                  {[job.department, job.location, t.dash.workModes[job.work_mode] ?? job.work_mode, fmt(j.posted, { when: timeAgo(job.created_at, locale) })]
                    .filter(Boolean)
                    .join(', ')}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link href={`/dashboard/candidates?job=${job.id}`} className="btn-ghost px-3 py-1.5 text-xs">
                  {fmt(j.applicants, { n: countFor(job.id) })}
                </Link>
                {job.status === 'open' && (
                  <a
                    href={`/careers/${company.slug}/${job.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-ghost px-3 py-1.5 text-xs"
                  >
                    {j.view}
                  </a>
                )}
                <Link href={`/dashboard/jobs/${job.id}`} className="btn-ghost px-3 py-1.5 text-xs">
                  {j.edit}
                </Link>
                <JobStatusToggle id={job.id} status={job.status} closeLabel={j.close} reopenLabel={j.reopen} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
