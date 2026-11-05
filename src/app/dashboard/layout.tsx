import { requireCompany } from '@/lib/company';
import { Logo } from '@/components/Logo';
import { CompanyBadge } from '@/components/careers/CompanyBadge';
import { NavLinks } from './_components/NavLinks';
import { signOut } from '../(auth)/actions';

export const dynamic = 'force-dynamic';
// AI calls (screening, job drafts) run inside server actions on these pages.
export const maxDuration = 60;

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { company, user } = await requireCompany();

  return (
    <div className="min-h-screen md:grid md:grid-cols-[240px_1fr]">
      {/* Sidebar (desktop) */}
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-black/5 bg-white px-4 py-6 md:flex">
        <Logo href="/dashboard" className="px-2" />
        <div className="mt-8 flex-1">
          <NavLinks />
        </div>
        <a
          href={`/careers/${company.slug}`}
          target="_blank"
          rel="noreferrer"
          className="mb-4 rounded-xl border border-black/5 bg-paper px-3 py-3 text-xs text-ink-soft hover:bg-paper-warm"
        >
          <span className="block font-semibold text-ink">Your careers page ↗</span>
          <span className="block truncate">/careers/{company.slug}</span>
        </a>
        <div className="flex items-center gap-3 border-t border-black/5 px-2 pt-4">
          <CompanyBadge company={company} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{company.name}</p>
            <p className="truncate text-xs text-ink-mute">{user.email}</p>
          </div>
        </div>
        <form action={signOut} className="mt-3 px-2">
          <button className="text-xs text-ink-mute hover:text-ink" type="submit">
            Sign out
          </button>
        </form>
      </aside>

      {/* Top bar (mobile) */}
      <header className="sticky top-0 z-30 border-b border-black/5 bg-white/90 backdrop-blur md:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          <Logo href="/dashboard" />
          <form action={signOut}>
            <button className="text-xs text-ink-mute" type="submit">
              Sign out
            </button>
          </form>
        </div>
        <div className="overflow-x-auto px-2 pb-2">
          <NavLinks horizontal />
        </div>
      </header>

      <main className="min-w-0 px-4 py-6 md:px-10 md:py-10">{children}</main>
    </div>
  );
}
