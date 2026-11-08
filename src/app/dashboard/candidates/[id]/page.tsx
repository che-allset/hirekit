import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireCompany } from '@/lib/company';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Application, Interview, Job } from '@/lib/types';
import { listConnections } from '@/lib/integrations';
import { SchedulePanel } from './SchedulePanel';
import { initials, safeUrl, timeAgo } from '@/lib/utils';
import { ScoreBadge, verdictStyle } from '../../_components/ui';
import { StageSelect } from '../../_components/StageSelect';
import { NotesForm } from './NotesForm';
import { RescreenButton } from './RescreenButton';
import { getDict } from '@/i18n/server';

export default async function CandidatePage({ params }: { params: { id: string } }) {
  const { supabase, company } = await requireCompany();
  const { locale, t } = getDict();
  const c = t.dash.candidates;
  const { data } = await supabase
    .from('applications')
    .select('*, jobs(*)')
    .eq('id', params.id)
    .eq('company_id', company.id)
    .maybeSingle();
  if (!data) notFound();
  const app = data as Application & { jobs: Job | null };

  // Ownership is proven by the RLS-scoped read above; now mint a short-lived CV link.
  let cvUrl: string | null = null;
  if (app.cv_path) {
    const { data: signed } = await createAdminClient().storage.from('cvs').createSignedUrl(app.cv_path, 60 * 60);
    cvUrl = signed?.signedUrl ?? null;
  }

  const [{ data: ivData }, connections] = await Promise.all([
    supabase
      .from('interviews')
      .select('*')
      .eq('application_id', app.id)
      .eq('company_id', company.id)
      .gte('starts_at', new Date(Date.now() - 2 * 3600_000).toISOString())
      .order('starts_at', { ascending: true }),
    listConnections(company.id),
  ]);
  const has = (p: string) => connections.some((c) => c.provider === p);

  const vs = verdictStyle(app.ai_verdict);
  const linkedin = safeUrl(app.linkedin_url);
  const portfolio = safeUrl(app.portfolio_url);

  return (
    <div className="mx-auto max-w-6xl">
      <Link href="/dashboard/candidates" className="text-sm text-ink-mute hover:text-ink">
        {c.back}
      </Link>

      <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 flex-none items-center justify-center rounded-2xl bg-brand-50 text-lg font-semibold text-brand-700">
            {initials(app.full_name)}
          </span>
          <div>
            <h1 className="font-display text-4xl leading-tight tracking-tight">{app.full_name}</h1>
            <p className="text-ink-soft">
              {c.appliedFor} <span className="font-medium text-ink">{app.jobs?.title ?? c.aRole}</span>,{' '}
              {timeAgo(app.created_at, locale)}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a href="#schedule" className="btn-signal px-4 py-2 text-sm">
            {t.dash.schedule.inviteCta}
          </a>
          <span className="text-sm text-ink-mute">{c.stage}</span>
          <StageSelect id={app.id} stage={app.stage} labels={t.dash.stages} ariaLabel={t.dash.moveToStage} errorLabel={t.dash.errors.saveFailed} />
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          {/* AI assessment */}
          <section className="card overflow-hidden">
            <div className="flex flex-col gap-4 border-b border-black/5 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <span className="text-brand-600">✦</span>
                <h2 className="font-semibold">{c.aiScreening}</h2>
                <ScoreBadge score={app.ai_score} verdict={app.ai_verdict} status={app.ai_status} showLabel />
              </div>
              <RescreenButton id={app.id} label={app.ai_status === 'done' ? c.rerun : c.run} runningLabel={c.running} />
            </div>

            {app.ai_status === 'done' && vs ? (
              <div className="p-6">
                <div className="flex items-start gap-6">
                  <div className="flex-none text-center">
                    <p className={`font-display text-5xl leading-none ${vs.text}`}>{app.ai_score}</p>
                    <p className="mt-1 text-xs text-ink-mute">{c.outOf}</p>
                  </div>
                  <p className="text-lg leading-relaxed">{app.ai_summary}</p>
                </div>

                <div className="mt-8 grid gap-6 sm:grid-cols-2">
                  <ListBlock title={c.strengths} none={c.noneNoted} tone="text-emerald-700" items={app.ai_strengths} />
                  <ListBlock title={c.gaps} none={c.noneNoted} tone="text-amber-700" items={app.ai_gaps} />
                </div>

                {app.ai_questions.length > 0 && (
                  <div className="mt-8">
                    <p className="text-sm font-semibold">{c.questions}</p>
                    <ol className="mt-3 space-y-2">
                      {app.ai_questions.map((q, i) => (
                        <li key={i} className="flex gap-3 rounded-xl bg-paper px-4 py-3 text-sm">
                          <span className="font-semibold text-brand-600">{i + 1}</span>
                          {q}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            ) : (
              <p className="p-6 text-sm text-ink-mute">
                {app.ai_status === 'pending' ? c.pendingText : c.notScoredText}
              </p>
            )}
            <p className="border-t border-black/5 bg-paper px-6 py-3 text-xs text-ink-mute">
              {c.disclaimer}
            </p>
          </section>

          {app.cover_letter && (
            <section className="card p-6">
              <h2 className="font-semibold">{c.coverLetter}</h2>
              <p className="mt-3 whitespace-pre-line leading-relaxed text-ink-soft">{app.cover_letter}</p>
            </section>
          )}
        </div>

        <div className="space-y-6">
          <section className="card p-6">
            <h2 className="font-semibold">{c.contact}</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <Row label={c.email}>
                <a href={`mailto:${app.email}`} className="text-brand-600 hover:underline">
                  {app.email}
                </a>
              </Row>
              {app.phone && (
                <Row label={c.phone}>
                  <a href={`tel:${app.phone}`} className="hover:underline">
                    {app.phone}
                  </a>
                </Row>
              )}
              {linkedin && (
                <Row label={c.linkedin}>
                  <a href={linkedin} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline">
                    {c.viewProfile}
                  </a>
                </Row>
              )}
              {portfolio && (
                <Row label={c.portfolio}>
                  <a href={portfolio} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline">
                    {c.openLink}
                  </a>
                </Row>
              )}
            </dl>
            {cvUrl ? (
              <a href={cvUrl} target="_blank" rel="noreferrer" className="btn-primary mt-6 w-full">
                {c.openCv}
              </a>
            ) : (
              <p className="mt-6 rounded-xl bg-paper px-4 py-3 text-center text-sm text-ink-mute">{c.noCv}</p>
            )}
          </section>

          <SchedulePanel
            applicationId={app.id}
            candidateEmail={app.email}
            connected={{ google: has('google'), microsoft: has('microsoft'), zoom: has('zoom') }}
            interviews={(ivData ?? []) as Interview[]}
            locale={locale}
            t={t.dash.schedule}
          />

          <section className="card p-6">
            <h2 className="font-semibold">{c.notes}</h2>
            <NotesForm id={app.id} initial={app.notes ?? ''} t={c} />
          </section>
        </div>
      </div>
    </div>
  );
}

function ListBlock({ title, tone, items, none }: { title: string; tone: string; items: string[]; none: string }) {
  return (
    <div>
      <p className={`text-sm font-semibold ${tone}`}>{title}</p>
      {items.length ? (
        <ul className="mt-2 space-y-2 text-sm text-ink-soft">
          {items.map((s, i) => (
            <li key={i} className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-current opacity-40" />
              {s}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-ink-mute">{none}</p>
      )}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-ink-mute">{label}</dt>
      <dd className="truncate text-right">{children}</dd>
    </div>
  );
}
