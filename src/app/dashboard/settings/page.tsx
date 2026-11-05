import { getOrigin, requireCompany } from '@/lib/company';
import { PageHeader } from '../_components/ui';
import { CopyButton } from '../_components/CopyButton';
import { SettingsForm } from './SettingsForm';

export default async function SettingsPage() {
  const { company } = await requireCompany();
  const origin = getOrigin();
  const careersUrl = `${origin}/careers/${company.slug}`;
  const snippet = `<script src="${origin}/widget.js" data-company="${company.slug}"></script>`;
  const iframe = `<iframe src="${origin}/embed/${company.slug}" style="width:100%;min-height:600px;border:0" title="Open positions"></iframe>`;

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Careers & widget" sub="Everything you need to plug HireKit into your website." />

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-6">
          <section className="card p-6">
            <h2 className="font-semibold">1 · Your careers page</h2>
            <p className="mt-1 text-sm text-ink-soft">Share this link anywhere: LinkedIn, job boards, email signatures.</p>
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-black/10 bg-paper p-2 pl-3">
              <span className="min-w-0 flex-1 truncate text-sm">{careersUrl}</span>
              <CopyButton value={careersUrl} />
              <a href={careersUrl} target="_blank" rel="noreferrer" className="btn-ghost px-3 py-1.5 text-xs">
                Open ↗
              </a>
            </div>
          </section>

          <section className="card p-6">
            <h2 className="font-semibold">2 · Website widget</h2>
            <p className="mt-1 text-sm text-ink-soft">
              Paste this where your jobs should appear. It lists open roles and lets people apply without leaving your
              site. Works with WordPress, Webflow, Wix, Squarespace and custom code.
            </p>
            <pre className="mt-4 overflow-x-auto rounded-xl bg-ink p-4 text-xs leading-relaxed text-white/90">{snippet}</pre>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <CopyButton value={snippet} label="Copy widget code" />
              <span className="text-xs text-ink-mute">
                Optional: add <code className="rounded bg-paper-warm px-1">data-target=&quot;#jobs&quot;</code> to render
                inside a specific element.
              </span>
            </div>

            <details className="mt-5 text-sm">
              <summary className="cursor-pointer text-ink-soft">Site builder blocks scripts? Use an iframe instead</summary>
              <pre className="mt-3 overflow-x-auto rounded-xl bg-paper-warm p-4 text-xs">{iframe}</pre>
              <CopyButton value={iframe} label="Copy iframe code" className="mt-2" />
            </details>
          </section>
        </div>

        <section className="card p-6">
          <h2 className="font-semibold">3 · Branding</h2>
          <p className="mt-1 text-sm text-ink-soft">Used on your careers page, widget and apply buttons.</p>
          <SettingsForm company={company} />
        </section>
      </div>
    </div>
  );
}
