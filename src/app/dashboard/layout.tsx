import { requireCompany } from '@/lib/company';
import { Logo } from '@/components/Logo';
import { CompanyBadge } from '@/components/careers/CompanyBadge';
import { NavLinks } from './_components/NavLinks';
import { signOut } from '../(auth)/actions';
import { getDict } from '@/i18n/server';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { getBilling } from '@/lib/billing';
import { fmt } from '@/i18n';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
// AI calls (screening, job drafts) run inside server actions on these pages.
export const maxDuration = 60;

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { supabase, company, user } = await requireCompany();
  const { locale, t } = getDict();
  // Remember the recruiter's language for notification emails (ignored if migration 003 isn't run yet).
  if (company.locale !== undefined && company.locale !== locale) {
    await supabase.from('companies').update({ locale }).eq('id', company.id);
  }
  const navLabels = t.dash.nav;
  const billing = await getBilling(company);
  const b = t.dash.billing;
  const banner =
    billing.plan === 'demo'
      ? null
      : !billing.active
        ? { tone: 'bg-rose-600 text-white', text: billing.trial ? b.bannerTrialEnded : b.bannerInactive, cta: b.bannerChoose }
        : billing.trial
          ? { tone: 'bg-signal text-graphite', text: fmt(b.bannerTrial, { days: billing.daysLeft }), cta: b.bannerUpgrade }
          : null;

  return (
    <div className="min-h-screen md:grid md:grid-cols-[240px_1fr]">
      {/* Sidebar (desktop) */}
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-black/5 bg-white px-4 py-6 md:flex">
        <Logo href="/dashboard" className="px-2" />
        <div className="mt-8 flex-1">
          <NavLinks labels={navLabels} />
        </div>
        <a
          href={`/careers/${company.slug}`}
          target="_blank"
          rel="noreferrer"
          className="mb-4 rounded-xl border border-black/5 bg-paper px-3 py-3 text-xs text-ink-soft hover:bg-paper-warm"
        >
          <span className="block font-semibold text-ink">{t.dash.yourCareersPage}</span>
          <span className="block truncate">/careers/{company.slug}</span>
        </a>
        <div className="flex items-center gap-3 border-t border-black/5 px-2 pt-4">
          <CompanyBadge company={company} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{company.name}</p>
            <p className="truncate text-xs text-ink-mute">{user.email}</p>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between gap-2 px-2">
          <form action={signOut}>
            <button className="text-xs text-ink-mute hover:text-ink" type="submit">
              {t.dash.signOut}
            </button>
          </form>
          <LanguageSwitcher locale={locale} label={t.nav.language} />
        </div>
      </aside>

      {/* Top bar (mobile) */}
      <header className="sticky top-0 z-30 border-b border-black/5 bg-white/90 backdrop-blur md:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          <Logo href="/dashboard" />
          <div className="flex items-center gap-3">
            <LanguageSwitcher locale={locale} label={t.nav.language} />
            <form action={signOut}>
              <button className="text-xs text-ink-mute" type="submit">
                {t.dash.signOut}
              </button>
            </form>
          </div>
        </div>
        <div className="overflow-x-auto px-2 pb-2">
          <NavLinks horizontal labels={navLabels} />
        </div>
      </header>

      <main className="min-w-0">
        {banner && (
          <div className={`flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-sm md:px-10 ${banner.tone}`}>
            <span className="font-medium">{banner.text}</span>
            <Link href="/dashboard/billing" className="font-bold underline underline-offset-4">
              {banner.cta}
            </Link>
          </div>
        )}
        <div className="px-4 py-6 md:px-10 md:py-10">{children}</div>
      </main>
    </div>
  );
}
