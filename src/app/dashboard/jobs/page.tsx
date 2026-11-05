import Link from 'next/link';
import { requireCompany } from '@/lib/company';
import type { Job } from '@/lib/types';
import { timeAgo } from '@/lib/utils';
import { EmptyState, PageHeader } from '../_components/ui';
import { JobStatusToggle } from './JobStatusToggle';

export default async function JobsPage() {
  const { supabase, company } = await requireCompany();
  const [{ data: jobsData }, { data: counts }] = await Promise.all([
    supabase.from('jobs').select('*').eq('company_id', company.id).order('created_at', { ascending: false }),
    supabase.from('applications').select('job_id').eq('company_id', company.id),
  ]);
  const jobs = (jobsData ?? []) as Job[];
  const countFor = (id: string) => (counts ?? []).filter((r: { job_id: string }) => r.job_id === id).length;

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Jobs"
        sub="Open roles show on your careers page and website widget automatically."
        action={
          <Link href="/dashboard/jobs/new" className="btn-primary">
            + New job
          </Link>
        }
      />

      {jobs.length === 0 ? (
        <EmptyState
          title="No jobs yet"
          body="Create your first role. Add a few notes and let AI draft the job post for you."
          action={
            <Link href="/dashboard/jobs/new" className="btn-primary">
              Create a job
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
                    {job.status === 'open' ? 'Open' : 'Closed'}
                  </span>
                </div>
                <p className="mt-1 text-sm text-ink-mute">
                  {[job.department, job.location, job.work_mode].filter(Boolean).join(' · ')} · posted{' '}
                  {timeAgo(job.created_at)}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link href={`/dashboard/candidates?job=${job.id}`} className="btn-ghost px-3 py-1.5 text-xs">
                  {countFor(job.id)} applicants
                </Link>
                {job.status === 'open' && (
                  <a
                    href={`/careers/${company.slug}/${job.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-ghost px-3 py-1.5 text-xs"
                  >
                    View ↗
                  </a>
                )}
                <Link href={`/dashboard/jobs/${job.id}`} className="btn-ghost px-3 py-1.5 text-xs">
                  Edit
                </Link>
                <JobStatusToggle id={job.id} status={job.status} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
