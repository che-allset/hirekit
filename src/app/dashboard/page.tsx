import Link from 'next/link';
import { getOrigin, requireCompany } from '@/lib/company';
import type { Application, Job } from '@/lib/types';
import { STAGES } from '@/lib/types';
import { timeAgo } from '@/lib/utils';
import { EmptyState, PageHeader, ScoreBadge, StatCard } from './_components/ui';
import { CopyButton } from './_components/CopyButton';
import { getDict } from '@/i18n/server';
import { fmt, type Dict } from '@/i18n';

type AppRow = Application & { jobs: { title: string } | null };

export default async function OverviewPage({ searchParams }: { searchParams: { welcome?: string } }) {
  const { supabase, company } = await requireCompany();
  const { locale, t } = getDict();
  const o = t.dash.overview;

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
        title={searchParams.welcome ? fmt(o.welcome, { company: company.name }) : o.title}
        sub={isNew ? o.subNew : o.sub}
        action={
          <Link href="/dashboard/jobs/new" className="btn-primary">
            {t.dash.newJob}
          </Link>
        }
      />

      {isNew ? (
        <Onboarding slug={company.slug} snippet={snippet} t={t} />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label={o.openRoles} value={openJobs.length} hint={fmt(o.total, { n: jobs.length })} />
            <StatCard label={o.applicants} value={apps.length} hint={fmt(o.newThisWeek, { n: newThisWeek })} />
            <StatCard label={o.strong} value={strong} hint={o.strongHint} />
            <StatCard label={o.interviewOffer} value={inInterview} />
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <section className="card p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">{o.topToReview}</h2>
                <Link href="/dashboard/candidates?view=list" className="text-sm text-ink-mute hover:text-ink">
                  {o.viewAll}
                </Link>
              </div>
              {toReview.length === 0 ? (
                <p className="mt-6 text-sm text-ink-mute">{o.caughtUp}</p>
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
                            {a.jobs?.title ?? o.role}, {timeAgo(a.created_at, locale)}
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
              <h2 className="font-semibold">{o.pipeline}</h2>
              <div className="mt-5 space-y-3">
                {STAGES.map((s) => {
                  const n = apps.filter((a) => a.stage === s.key).length;
                  const pct = apps.length ? Math.round((n / apps.length) * 100) : 0;
                  return (
                    <Link key={s.key} href={`/dashboard/candidates?stage=${s.key}&view=list`} className="block">
                      <div className="flex justify-between text-sm">
                        <span className="text-ink-soft">{t.dash.stages[s.key]}</span>
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
            <h2 className="font-semibold">{o.perRole}</h2>
            {jobs.length === 0 ? (
              <EmptyState title={o.noRoles} body={o.noRolesBody} />
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[520px] text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wide text-ink-mute">
                      <th className="pb-3 font-medium">{o.role}</th>
                      <th className="pb-3 font-medium">{o.status}</th>
                      <th className="pb-3 text-right font-medium">{o.applicants}</th>
                      <th className="pb-3 text-right font-medium">{o.strongCol}</th>
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
                              {j.status === 'open' ? t.dash.open : t.dash.closed}
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

function Onboarding({ slug, snippet, t }: { slug: string; snippet: string; t: Dict }) {
  const o = t.dash.overview;
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Step n={1} title={o.step1} body={o.step1Body}>
        <Link href="/dashboard/jobs/new" className="btn-primary mt-4">
          {o.step1Cta}
        </Link>
      </Step>
      <Step n={2} title={o.step2} body={o.step2Body}>
        <a href={`/careers/${slug}`} target="_blank" rel="noreferrer" className="btn-ghost mt-4">
          {o.step2Cta}
        </a>
      </Step>
      <Step n={3} title={o.step3} body={o.step3Body}>
        <pre className="mt-4 overflow-x-auto rounded-xl bg-ink p-3 text-[11px] text-white/90">{snippet}</pre>
        <CopyButton value={snippet} label={o.copyCode} copiedLabel={t.dash.copied} className="mt-3" />
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
