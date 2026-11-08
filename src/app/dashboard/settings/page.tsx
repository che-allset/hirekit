import { getOrigin, requireCompany } from '@/lib/company';
import { PageHeader } from '../_components/ui';
import { CopyButton } from '../_components/CopyButton';
import { SettingsForm } from './SettingsForm';
import { getDict } from '@/i18n/server';
import { Integrations } from './Integrations';

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: { connected?: string; integration_error?: string; provider?: string };
}) {
  const { company } = await requireCompany();
  const { t } = getDict();
  const st = t.dash.settings;
  const origin = getOrigin();
  const careersUrl = `${origin}/careers/${company.slug}`;
  const snippet = `<script src="${origin}/widget.js" data-company="${company.slug}"></script>`;
  const iframe = `<iframe src="${origin}/embed/${company.slug}" style="width:100%;min-height:600px;border:0" title="${st.iframeTitle}"></iframe>`;

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title={st.title} sub={st.sub} />

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-6">
          <section className="card p-6">
            <h2 className="font-semibold">{st.careersTitle}</h2>
            <p className="mt-1 text-sm text-ink-soft">{st.careersBody}</p>
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-black/10 bg-paper p-2 pl-3">
              <span className="min-w-0 flex-1 truncate text-sm">{careersUrl}</span>
              <CopyButton value={careersUrl} label={t.dash.copy} copiedLabel={t.dash.copied} />
              <a href={careersUrl} target="_blank" rel="noreferrer" className="btn-ghost px-3 py-1.5 text-xs">
                {t.dash.candidates.openLink}
              </a>
            </div>
          </section>

          <section className="card p-6">
            <h2 className="font-semibold">{st.widgetTitle}</h2>
            <p className="mt-1 text-sm text-ink-soft">
              {st.widgetBody}
            </p>
            <pre className="mt-4 overflow-x-auto rounded-xl bg-ink p-4 text-xs leading-relaxed text-white/90">{snippet}</pre>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <CopyButton value={snippet} label={st.copyWidget} copiedLabel={t.dash.copied} />
              <span className="text-xs text-ink-mute">
                {st.targetHint.split(/(\{code\}|\{lang\})/).map((part, i) =>
                  part === '{code}' ? (
                    <code key={i} className="rounded bg-paper-warm px-1">data-target=&quot;#jobs&quot;</code>
                  ) : part === '{lang}' ? (
                    <code key={i} className="rounded bg-paper-warm px-1">data-lang=&quot;de&quot;</code>
                  ) : (
                    <span key={i}>{part}</span>
                  ),
                )}
              </span>
            </div>

            <details className="mt-5 text-sm">
              <summary className="cursor-pointer text-ink-soft">{st.iframeSummary}</summary>
              <pre className="mt-3 overflow-x-auto rounded-xl bg-paper-warm p-4 text-xs">{iframe}</pre>
              <CopyButton value={iframe} label={st.copyIframe} copiedLabel={t.dash.copied} className="mt-2" />
            </details>
          </section>
        </div>

        <div className="space-y-6">
          <section className="card p-6">
            <h2 className="font-semibold">{st.brandTitle}</h2>
            <p className="mt-1 text-sm text-ink-soft">{st.brandBody}</p>
            <SettingsForm company={company} t={st} />
          </section>
          <Integrations company={company} t={t.dash.integrations} searchParams={searchParams} />
        </div>
      </div>
    </div>
  );
}
