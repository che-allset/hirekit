import Link from 'next/link';
import { requireCompany } from '@/lib/company';
import { STAGES, type Application, type Job, type Stage, type Verdict } from '@/lib/types';
import { cn, initials, timeAgo } from '@/lib/utils';
import { EmptyState, PageHeader, ScoreBadge } from '../_components/ui';
import { StageSelect } from '../_components/StageSelect';
import { Filters } from './Filters';
import { getDict } from '@/i18n/server';
import type { Dict, Locale } from '@/i18n';

type AppRow = Application & { jobs: { title: string } | null };

type Search = { view?: string; job?: string; verdict?: string; stage?: string; q?: string };

export default async function CandidatesPage({ searchParams }: { searchParams: Search }) {
  const { supabase, company } = await requireCompany();
  const view = searchParams.view === 'list' ? 'list' : 'board';
  const { locale, t } = getDict();
  const c = t.dash.candidates;

  let query = supabase
    .from('applications')
    .select('*, jobs(title)')
    .eq('company_id', company.id)
    .order('ai_score', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (searchParams.job) query = query.eq('job_id', searchParams.job);
  if (searchParams.verdict && ['strong', 'possible', 'weak'].includes(searchParams.verdict))
    query = query.eq('ai_verdict', searchParams.verdict as Verdict);
  if (searchParams.stage && STAGES.some((s) => s.key === searchParams.stage))
    query = query.eq('stage', searchParams.stage as Stage);
  if (searchParams.q) {
    const q = searchParams.q.replace(/[%,()]/g, ' ').trim().slice(0, 60);
    if (q) query = query.or(`full_name.ilike.%${q}%,email.ilike.%${q}%`);
  }

  const [{ data: appsData }, { data: jobsData }] = await Promise.all([
    query,
    supabase.from('jobs').select('id,title').eq('company_id', company.id).order('created_at', { ascending: false }),
  ]);
  const apps = (appsData ?? []) as AppRow[];
  const jobs = (jobsData ?? []) as Pick<Job, 'id' | 'title'>[];

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        title={c.title}
        sub={c.sub}
        action={<ViewToggle view={view} searchParams={searchParams} labels={{ board: c.board, list: c.list }} />}
      />
      <Filters jobs={jobs} t={t.dash} />

      {apps.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title={c.emptyTitle}
            body={c.emptyBody}
            action={
              <a href={`/careers/${company.slug}`} target="_blank" rel="noreferrer" className="btn-ghost">
                {c.openCareers}
              </a>
            }
          />
        </div>
      ) : view === 'board' ? (
        <Board apps={apps} t={t} locale={locale} />
      ) : (
        <List apps={apps} t={t} locale={locale} />
      )}
    </div>
  );
}

function ViewToggle({ view, searchParams, labels }: { view: 'board' | 'list'; searchParams: Search; labels: Record<'board' | 'list', string> }) {
  const href = (v: string) => {
    const p = new URLSearchParams();
    Object.entries({ ...searchParams, view: v }).forEach(([k, val]) => {
      if (val) p.set(k, String(val));
    });
    return `/dashboard/candidates?${p.toString()}`;
  };
  return (
    <div className="inline-flex rounded-xl border border-black/10 bg-white p-1 text-sm">
      {(['board', 'list'] as const).map((v) => (
        <Link
          key={v}
          href={href(v)}
          className={cn(
            'rounded-lg px-3 py-1.5 font-medium',
            view === v ? 'bg-ink text-white' : 'text-ink-soft hover:text-ink',
          )}
        >
          {labels[v]}
        </Link>
      ))}
    </div>
  );
}

function Board({ apps, t, locale }: { apps: AppRow[]; t: Dict; locale: Locale }) {
  return (
    <div className="-mx-4 mt-6 overflow-x-auto px-4 pb-4 md:-mx-10 md:px-10">
      <div className="grid min-w-[1100px] grid-cols-6 gap-3">
        {STAGES.map((s) => {
          const items = apps.filter((a) => a.stage === s.key);
          return (
            <div key={s.key} className="rounded-2xl bg-paper-warm/70 p-2">
              <div className="flex items-center justify-between px-2 py-2 text-xs font-semibold uppercase tracking-wide text-ink-mute">
                {t.dash.stages[s.key]}
                <span className="rounded-full bg-white px-2 py-0.5 tabular-nums">{items.length}</span>
              </div>
              <div className="space-y-2">
                {items.map((a) => (
                  <div key={a.id} className="rounded-xl border border-black/5 bg-white p-3 shadow-sm transition hover:shadow-card">
                    <Link href={`/dashboard/candidates/${a.id}`} className="block">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold leading-tight">{a.full_name}</p>
                        <ScoreBadge score={a.ai_score} verdict={a.ai_verdict} status={a.ai_status} />
                      </div>
                      <p className="mt-1 truncate text-xs text-ink-mute">{a.jobs?.title}</p>
                      {a.ai_summary && <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-ink-soft">{a.ai_summary}</p>}
                    </Link>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[11px] text-ink-mute">{timeAgo(a.created_at, locale)}</span>
                      <StageSelect id={a.id} stage={a.stage} compact labels={t.dash.stages} ariaLabel={t.dash.moveToStage} errorLabel={t.dash.errors.saveFailed} />
                    </div>
                  </div>
                ))}
                {items.length === 0 && <p className="px-2 py-6 text-center text-xs text-ink-mute">{t.dash.candidates.empty}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function List({ apps, t, locale }: { apps: AppRow[]; t: Dict; locale: Locale }) {
  const c = t.dash.candidates;
  return (
    <div className="card mt-6 overflow-x-auto">
      <table className="w-full min-w-[760px] text-sm">
        <thead>
          <tr className="border-b border-black/5 text-left text-xs uppercase tracking-wide text-ink-mute">
            <th className="px-5 py-3 font-medium">{c.candidate}</th>
            <th className="px-5 py-3 font-medium">{c.role}</th>
            <th className="px-5 py-3 font-medium">{c.aiFit}</th>
            <th className="px-5 py-3 font-medium">{c.summary}</th>
            <th className="px-5 py-3 font-medium">{c.stage}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-black/5">
          {apps.map((a) => (
            <tr key={a.id} className="hover:bg-paper">
              <td className="px-5 py-3">
                <Link href={`/dashboard/candidates/${a.id}`} className="flex items-center gap-3">
                  <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-700">
                    {initials(a.full_name)}
                  </span>
                  <span>
                    <span className="block font-medium hover:underline">{a.full_name}</span>
                    <span className="block text-xs text-ink-mute">{timeAgo(a.created_at, locale)}</span>
                  </span>
                </Link>
              </td>
              <td className="px-5 py-3 text-ink-soft">{a.jobs?.title}</td>
              <td className="px-5 py-3">
                <ScoreBadge score={a.ai_score} verdict={a.ai_verdict} status={a.ai_status} />
              </td>
              <td className="max-w-sm px-5 py-3 text-ink-soft">
                <p className="line-clamp-2">{a.ai_summary ?? '—'}</p>
              </td>
              <td className="px-5 py-3">
                <StageSelect id={a.id} stage={a.stage} compact labels={t.dash.stages} ariaLabel={t.dash.moveToStage} errorLabel={t.dash.errors.saveFailed} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
