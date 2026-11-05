import Link from 'next/link';
import { getOrigin, requireCompany } from '@/lib/company';
import type { Application, Job } from '@/lib/types';
import { STAGES } from '@/lib/types';
import { timeAgo } from '@/lib/utils';
import { EmptyState, PageHeader, ScoreBadge, StatCard } from './_components/ui';
import { CopyButton } from './_components/CopyButton';

type AppRow = Application & { jobs: { title: string } | null };

export default async function OverviewPage({ searchParams }: { searchParams: { welcome?: string } }) {
  const { supabase, company } = await requireCompany();

  const [{ data: jobsData }, { data: appsData }] = await Promise.all([
    supabase.from('jobs').select('*').eq('company_id', company.id).order('created_at', { ascending: false }),
    supabase
      .from('applications')
      .select('*, jobs(title)')
      .eq('company_id', company.id)
      .order('created_at', { ascending: false }),
  ]);
  const jobs = (jobsData ?? []) as Job[];
  const apps = (appsData ?? []) as AppRow[];

  const openJobs = jobs.filter((j) => j.status === 'open');
  const weekAgo = Date.now() - 7 * 24 * 3600 * 1000;
  const newThisWeek = apps.filter((a) => new Date(a.created_at).getTime() > weekAgo).length;
  const strong = apps.filter((a) => a.ai_verdict === 'strong' && a.stage !== 'rejected').length;
  const inInterview = apps.filter((a) => a.stage === 'interview' || a.stage === 'offer').length;

  const toReview = apps
    .filter((a) => a.stage === 'applied' || a.stage === 'screening')
    .sort((a, b) => (b.ai_score ?? -1) - (a.ai_score ?? -1))
    .slice(0, 5);

  const snippet = `<script src="${getOrigin()}/widget.js" data-company="${company.slug}"></script>`;
  const isNew = jobs.length === 0;

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title={searchParams.welcome ? `Welcome, ${company.name}` : 'Overview'}
        sub={isNew ? 'Three steps and you are hiring.' : 'Here is where your hiring stands today.'}
        action={
          <Link href="/dashboard/jobs/new" className="btn-primary">
            + New job
          </Link>
        }
      />

      {isNew ? (
        <Onboarding slug={company.slug} snippet={snippet} />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Open roles" value={openJobs.length} hint={`${jobs.length} total`} />
            <StatCard label="Applicants" value={apps.length} hint={`${newThisWeek} new this week`} />
            <StatCard label="Strong matches" value={strong} hint="Scored 80+ by AI" />
            <StatCard label="In interview / offer" value={inInterview} />
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <section className="card p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Top candidates to review</h2>
                <Link href="/dashboard/candidates?view=list" className="text-sm text-ink-mute hover:text-ink">
                  View all →
                </Link>
              </div>
              {toReview.length === 0 ? (
                <p className="mt-6 text-sm text-ink-mute">You are all caught up. New applicants will appear here.</p>
              ) : (
                <ul className="mt-4 divide-y divide-black/5">
                  {toReview.map((a) => (
                    <li key={a.id}>
                      <Link
                        href={`/dashboard/candidates/${a.id}`}
                        className="-mx-2 flex items-center justify-between gap-4 rounded-xl px-2 py-3 hover:bg-paper"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium">{a.full_name}</p>
                          <p className="truncate text-sm text-ink-mute">
                            {a.jobs?.title ?? 'Role'} · {timeAgo(a.created_at)}
                          </p>
                        </div>
                        <ScoreBadge score={a.ai_score} verdict={a.ai_verdict} status={a.ai_status} />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="card p-6">
              <h2 className="font-semibold">Pipeline</h2>
              <div className="mt-5 space-y-3">
                {STAGES.map((s) => {
                  const n = apps.filter((a) => a.stage === s.key).length;
                  const pct = apps.length ? Math.round((n / apps.length) * 100) : 0;
                  return (
                    <Link key={s.key} href={`/dashboard/candidates?stage=${s.key}&view=list`} className="block">
                      <div className="flex justify-between text-sm">
                        <span className="text-ink-soft">{s.label}</span>
                        <span className="font-medium tabular-nums">{n}</span>
                      </div>
                      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-black/5">
                        <div
                          className={s.key === 'rejected' ? 'h-full rounded-full bg-black/20' : 'h-full rounded-full bg-brand-500'}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          </div>

          <section className="card mt-6 p-6">
            <h2 className="font-semibold">Applicants per role</h2>
            {jobs.length === 0 ? (
              <EmptyState title="No roles yet" body="Create your first role to start receiving applicants." />
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[520px] text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wide text-ink-mute">
                      <th className="pb-3 font-medium">Role</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 text-right font-medium">Applicants</th>
                      <th className="pb-3 text-right font-medium">Strong</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {jobs.map((j) => {
                      const forJob = apps.filter((a) => a.job_id === j.id);
                      return (
                        <tr key={j.id}>
                          <td className="py-3">
                            <Link href={`/dashboard/candidates?job=${j.id}`} className="font-medium hover:underline">
                              {j.title}
                            </Link>
                          </td>
                          <td className="py-3">
                            <span
                              className={
                                j.status === 'open'
                                  ? 'chip bg-emerald-50 text-emerald-700'
                                  : 'chip bg-black/5 text-ink-mute'
                              }
                            >
                              {j.status === 'open' ? 'Open' : 'Closed'}
                            </span>
                          </td>
                          <td className="py-3 text-right tabular-nums">{forJob.length}</td>
                          <td className="py-3 text-right tabular-nums">
                            {forJob.filter((a) => a.ai_verdict === 'strong').length}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function Onboarding({ slug, snippet }: { slug: string; snippet: string }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Step n={1} title="Post your first role" body="Add a title and a few notes. AI can write the rest.">
        <Link href="/dashboard/jobs/new" className="btn-primary mt-4">
          Create a job
        </Link>
      </Step>
      <Step n={2} title="Share your careers page" body="Your branded jobs page is already live.">
        <a href={`/careers/${slug}`} target="_blank" rel="noreferrer" className="btn-ghost mt-4">
          Open careers page ↗
        </a>
      </Step>
      <Step n={3} title="Add jobs to your website" body="Paste this line where your jobs should appear.">
        <pre className="mt-4 overflow-x-auto rounded-xl bg-ink p-3 text-[11px] text-white/90">{snippet}</pre>
        <CopyButton value={snippet} label="Copy code" className="mt-3" />
      </Step>
    </div>
  );
}

function Step({ n, title, body, children }: { n: number; title: string; body: string; children: React.ReactNode }) {
  return (
    <div className="card flex flex-col p-6">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-sm font-semibold text-brand-600">
        {n}
      </span>
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-ink-soft">{body}</p>
      <div className="mt-auto">{children}</div>
    </div>
  );
}
