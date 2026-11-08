import { ALL_PROVIDERS, isConfigured, listConnections } from '@/lib/integrations';
import { DEMO_SLUG } from '@/lib/demo';
import type { Company, IntegrationProvider } from '@/lib/types';
import type { Dict } from '@/i18n';
import { fmt } from '@/i18n';
import { disconnectIntegration } from '../actions';

const LOGOS: Record<IntegrationProvider, React.ReactNode> = {
  google: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
      <rect x="3" y="4" width="18" height="17" rx="3" fill="#fff" stroke="#4285F4" strokeWidth="2" />
      <path d="M3 9h18" stroke="#4285F4" strokeWidth="2" />
      <path d="M8 2v4M16 2v4" stroke="#EA4335" strokeWidth="2" strokeLinecap="round" />
      <rect x="7" y="12" width="4" height="4" rx="1" fill="#34A853" />
      <rect x="13" y="12" width="4" height="4" rx="1" fill="#FBBC04" />
    </svg>
  ),
  microsoft: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
      <rect x="3" y="3" width="8.5" height="8.5" fill="#F25022" />
      <rect x="12.5" y="3" width="8.5" height="8.5" fill="#7FBA00" />
      <rect x="3" y="12.5" width="8.5" height="8.5" fill="#00A4EF" />
      <rect x="12.5" y="12.5" width="8.5" height="8.5" fill="#FFB900" />
    </svg>
  ),
  zoom: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
      <rect x="1" y="4" width="22" height="16" rx="5" fill="#2D8CFF" />
      <path d="M6 9h7a1.5 1.5 0 0 1 1.5 1.5V15H8a2 2 0 0 1-2-2V9zM15.5 11l3-2v6l-3-2z" fill="#fff" />
    </svg>
  ),
};

export async function Integrations({
  company,
  t,
  searchParams,
}: {
  company: Company;
  t: Dict['dash']['integrations'];
  searchParams: { connected?: string; integration_error?: string; provider?: string };
}) {
  const connections = await listConnections(company.id);
  const isDemo = company.slug === DEMO_SLUG;
  const nameOf = (p?: string) => (p && p in t.providers ? t.providers[p as IntegrationProvider].name : '');

  let message: { tone: string; text: string } | null = null;
  if (searchParams.connected) message = { tone: 'bg-emerald-50 text-emerald-800', text: fmt(t.connectedMsg, { name: nameOf(searchParams.connected) }) };
  else if (searchParams.integration_error) {
    const key = searchParams.integration_error as keyof typeof t.errors;
    message = { tone: 'bg-rose-50 text-rose-800', text: fmt(t.errors[key] ?? t.errors.unknown, { name: nameOf(searchParams.provider) }) };
  }

  return (
    <section id="integrations" className="card scroll-mt-24 p-6">
      <h2 className="font-semibold">{t.title}</h2>
      <p className="mt-1 text-sm text-ink-soft">{t.sub}</p>
      {message && <p className={`mt-4 rounded-xl px-4 py-3 text-sm ${message.tone}`}>{message.text}</p>}
      {isDemo && <p className="mt-4 rounded-xl bg-paper-warm px-4 py-3 text-sm text-ink-soft">{t.demoNote}</p>}
      <ul className="mt-5 divide-y divide-black/5">
        {ALL_PROVIDERS.map((p) => {
          const conn = connections.find((c) => c.provider === p);
          const configured = isConfigured(p);
          return (
            <li key={p} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-paper">{LOGOS[p]}</span>
                <div className="min-w-0">
                  <p className="font-semibold">{t.providers[p].name}</p>
                  <p className="text-sm text-ink-soft">
                    {conn ? fmt(t.connectedAs, { email: conn.account_email ?? '—' }) : t.providers[p].desc}
                  </p>
                </div>
              </div>
              {conn ? (
                <form action={disconnectIntegration.bind(null, p)}>
                  <button type="submit" className="btn-ghost px-3 py-1.5 text-xs">
                    {t.disconnect}
                  </button>
                </form>
              ) : isDemo ? null : configured ? (
                <a href={`/api/integrations/${p}/connect`} className="btn-primary px-4 py-2 text-sm">
                  {t.connect}
                </a>
              ) : (
                <span className="text-xs text-ink-mute">{t.notConfigured}</span>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
