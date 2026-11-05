import Link from 'next/link';
import type { Company, Job } from '@/lib/types';

export function JobList({ company, jobs, basePath }: { company: Company; jobs: Job[]; basePath: string }) {
  if (jobs.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-black/10 bg-white p-10 text-center">
        <p className="font-medium">No open roles right now</p>
        <p className="mt-1 text-sm text-ink-mute">Check back soon. {company.name} is growing.</p>
      </div>
    );
  }

  const groups = new Map<string, Job[]>();
  for (const job of jobs) {
    const key = job.department || 'Open roles';
    groups.set(key, [...(groups.get(key) ?? []), job]);
  }

  return (
    <div className="space-y-8">
      {Array.from(groups.entries()).map(([dept, list]) => (
        <div key={dept}>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-ink-mute">{dept}</h2>
          <ul className="space-y-3">
            {list.map((job) => (
              <li key={job.id}>
                <Link
                  href={`${basePath}/${job.id}`}
                  className="group flex items-center justify-between gap-4 rounded-2xl border border-black/[0.06] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-card"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold group-hover:underline">{job.title}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-ink-soft">
                      {job.location && <Tag>{job.location}</Tag>}
                      <Tag>{job.work_mode}</Tag>
                      <Tag>{job.employment_type}</Tag>
                      {job.salary_range && <Tag>{job.salary_range}</Tag>}
                    </div>
                  </div>
                  <span
                    className="flex h-9 w-9 flex-none items-center justify-center rounded-full text-white transition group-hover:translate-x-0.5"
                    style={{ backgroundColor: company.brand_color }}
                    aria-hidden="true"
                  >
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-paper-warm px-2.5 py-1">{children}</span>;
}
