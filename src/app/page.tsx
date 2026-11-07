import Link from 'next/link';
import { Logo, LogoMark } from '@/components/Logo';
import { Photo } from '@/components/landing/Photo';
import { IntroFilm, SalesVideo } from '@/components/landing/Videos';
import { Pricing } from '@/components/landing/Pricing';
import { TryIt } from '@/components/landing/TryIt';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { getOrigin } from '@/lib/company';
import { getDict } from '@/i18n/server';
import type { Dict, Locale } from '@/i18n';

const DEMO_SLUG = 'northwind-labs';

export const dynamic = 'force-dynamic';

export default function LandingPage() {
  const origin = getOrigin();
  const { locale, t } = getDict();
  return (
    <div className="overflow-x-hidden">
      <Nav t={t} locale={locale} />
      <main>
        <Hero t={t} />
        <PhotoBand t={t} />
        <Problem t={t} locale={locale} />
        <Steps t={t} />
        <Screening t={t} />
        <TrySection t={t} locale={locale} />
        <Widget t={t} origin={origin} />
        <Fairness t={t} />
        <section id="pricing" className="scroll-mt-20 py-24 md:py-32">
          <div className="mx-auto max-w-6xl px-5">
            <Pricing t={t.pricing} />
          </div>
        </section>
        <Faq t={t} />
        <FinalCta t={t} />
      </main>
      <Footer t={t} locale={locale} />
    </div>
  );
}

type P = { t: Dict };

/* ───────────────────────── Nav ───────────────────────── */

function Nav({ t, locale }: P & { locale: Locale }) {
  return (
    <header className="sticky top-0 z-40 border-b border-graphite/10 bg-steel/90 backdrop-blur">
      <div className="flex h-[68px] w-full items-center justify-between gap-3 px-5 md:px-8 lg:px-12">
        <Logo />
        <nav aria-label="Main" className="hidden items-center gap-7 text-[15px] text-graphite-600 lg:flex">
          <a href="#how" className="hover:text-graphite">{t.nav.howItWorks}</a>
          <a href="#screening" className="hover:text-graphite">{t.nav.screening}</a>
          <a href="#try" className="hover:text-graphite">{t.nav.tryIt}</a>
          <a href="#pricing" className="hover:text-graphite">{t.nav.pricing}</a>
          <a href="#faq" className="hover:text-graphite">{t.nav.faq}</a>
        </nav>
        <div className="flex items-center gap-2">
          <LanguageSwitcher locale={locale} label={t.nav.language} className="hidden sm:inline-flex" />
          <Link href="/login" className="hidden px-3 py-2 text-[15px] font-bold text-graphite-600 hover:text-graphite md:block">
            {t.nav.login}
          </Link>
          <Link href="/signup" className="btn-signal py-2.5">
            {t.nav.startHiring}
          </Link>
        </div>
      </div>
    </header>
  );
}

/* ───────────────────────── Hero ───────────────────────── */

function Hero({ t }: P) {
  return (
    <section className="relative">
      <div className="grid w-full items-center gap-12 px-5 pb-20 pt-14 md:px-8 md:pt-20 lg:grid-cols-[1fr_1.08fr] lg:gap-16 lg:px-12">
        <div className="hero-in">
          <h1 className="font-display text-[44px] leading-[1.02] sm:text-6xl lg:text-[64px] xl:text-[72px] 2xl:text-[84px]">{t.hero.title}</h1>
          <p className="mt-7 max-w-[34rem] text-lg leading-relaxed text-graphite-600 md:text-xl">{t.hero.sub}</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/signup" className="btn-signal px-7 py-4 text-base">
              {t.hero.cta}
            </Link>
            <a href="#tour" className="btn-ghost px-7 py-4 text-base">
              {t.hero.tour}
            </a>
          </div>
          <p className="mt-4 text-sm text-graphite-400">{t.hero.note}</p>
        </div>

        <div className="hero-in relative [animation-delay:120ms]">
          <div className="absolute -right-5 -top-5 hidden h-[78%] w-[82%] rounded-[18px] bg-signal sm:block" aria-hidden="true" />
          <div className="relative rounded-[18px] bg-graphite p-2 shadow-lift">
            <IntroFilm label={t.hero.introAria} />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── Photos ───────────────────────── */

function PhotoBand({ t }: P) {
  return (
    <section aria-label={t.photos.aria} className="mx-auto max-w-6xl px-5">
      <div className="grid gap-3 md:grid-cols-[1.5fr_1fr] md:grid-rows-2">
        <div className="relative md:row-span-2">
          <Photo src="/photos/team.jpg" alt={t.photos.alt1} className="h-80 rounded-[14px] md:h-full" priority />
          <div className="absolute bottom-5 left-5 max-w-[18rem] rounded-[12px] bg-white p-4 shadow-lift">
            <div className="flex items-center justify-between gap-6">
              <p className="font-bold">Lea Müller</p>
              <span className="chip bg-forest text-white">86</span>
            </div>
            <p className="mt-1 text-sm text-graphite-600">{t.photos.role}</p>
            <p className="mt-3 text-sm leading-snug">{t.photos.text}</p>
          </div>
        </div>
        <Photo src="/photos/interview.jpg" alt={t.photos.alt2} className="h-64 rounded-[14px]" sizes="(min-width: 768px) 40vw, 100vw" />
        <Photo src="/photos/laughing.jpg" alt={t.photos.alt3} className="h-64 rounded-[14px]" sizes="(min-width: 768px) 40vw, 100vw" />
      </div>
    </section>
  );
}

/* ───────────────────────── Problem + VSL ───────────────────────── */

function Problem({ t, locale }: P & { locale: Locale }) {
  return (
    <section id="tour" className="mt-24 scroll-mt-20 bg-graphite py-24 text-white md:mt-32 md:py-32">
      <div className="mx-auto grid max-w-6xl gap-14 px-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <h2 className="font-display text-4xl leading-[1.05] md:text-5xl">{t.problem.title}</h2>
          <div className="mt-8 space-y-5 text-lg leading-relaxed text-white/75">
            <p>{t.problem.p1}</p>
            <p>{t.problem.p2}</p>
          </div>
        </div>
        <SalesVideo watch={t.problem.watch} videoAria={t.problem.videoAria} playAria={t.problem.playAria} poster={`/video/tour-poster-${locale}.jpg`} />
      </div>
    </section>
  );
}

/* ───────────────────────── Steps ───────────────────────── */

function Steps({ t }: P) {
  return (
    <section id="how" className="scroll-mt-20 py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-5">
        <h2 className="max-w-2xl font-display text-4xl leading-[1.05] md:text-5xl">{t.steps.title}</h2>
        <div className="relative mt-16">
          <div className="absolute left-0 right-0 top-[22px] hidden h-[3px] bg-graphite md:block" aria-hidden="true" />
          <ol className="relative grid gap-10 md:grid-cols-4 md:gap-6">
            {t.steps.items.map((s, i) => (
              <li key={s.title} className="relative">
                <span className="relative z-10 flex h-11 w-11 items-center justify-center rounded-full bg-signal font-display text-xl ring-[6px] ring-steel">
                  {i + 1}
                </span>
                <h3 className="mt-6 text-xl font-bold">{s.title}</h3>
                <p className="mt-2 leading-relaxed text-graphite-600">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── Screening ───────────────────────── */

function Screening({ t }: P) {
  const s = t.screening;
  return (
    <section id="screening" className="scroll-mt-20 bg-white py-24 md:py-32">
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 lg:grid-cols-2">
        <div className="relative">
          <Photo src="/photos/resume.jpg" alt={s.alt} className="h-[420px] rounded-[14px] md:h-[520px]" />
          <div className="absolute -bottom-8 right-4 w-[min(92%,24rem)] rounded-[14px] border border-graphite/10 bg-white p-6 shadow-lift sm:-right-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-graphite-600">{s.role}</p>
                <p className="mt-0.5 text-lg font-bold">Amara Okafor</p>
              </div>
              <div className="text-right">
                <p className="font-display text-5xl leading-none text-forest">92</p>
                <p className="text-xs font-bold text-forest">{s.verdict}</p>
              </div>
            </div>
            <ul className="mt-5 space-y-2 text-sm">
              <li className="flex gap-2"><Dot className="bg-forest" />{s.s1}</li>
              <li className="flex gap-2"><Dot className="bg-forest" />{s.s2}</li>
              <li className="flex gap-2"><Dot className="bg-signal-600" />{s.g1}</li>
            </ul>
            <p className="mt-5 rounded-[10px] bg-steel-50 p-3 text-sm">
              <span className="font-bold">{s.ask}</span> {s.askQ}
            </p>
          </div>
        </div>
        <div className="lg:pl-6">
          <h2 className="font-display text-4xl leading-[1.05] md:text-5xl">{s.title}</h2>
          <p className="mt-6 text-lg leading-relaxed text-graphite-600">{s.sub}</p>
          <dl className="mt-10 grid gap-6 sm:grid-cols-2">
            {s.points.map((p) => (
              <div key={p.t}>
                <dt className="font-bold">{p.t}</dt>
                <dd className="mt-1 text-graphite-600">{p.d}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

function Dot({ className }: { className: string }) {
  return <span className={`mt-1.5 h-2 w-2 flex-none rounded-full ${className}`} aria-hidden="true" />;
}

/* ───────────────────────── Try it live ───────────────────────── */

function TrySection({ t, locale }: P & { locale: Locale }) {
  return (
    <section id="try" className="scroll-mt-20 bg-steel-200 py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-5">
        <div className="max-w-2xl">
          <h2 className="font-display text-4xl leading-[1.05] md:text-5xl">{t.tryIt.title}</h2>
          <p className="mt-5 text-lg leading-relaxed text-graphite-600">{t.tryIt.sub}</p>
        </div>
        <div className="mt-12">
          <TryIt key={locale} t={t.tryIt} locale={locale} />
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── Widget ───────────────────────── */

function Widget({ t, origin }: P & { origin: string }) {
  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <h2 className="font-display text-4xl leading-[1.05] md:text-5xl">{t.widget.title}</h2>
          <p className="mt-6 text-lg leading-relaxed text-graphite-600">{t.widget.sub}</p>
          <a href="/demo.html" className="btn-primary mt-8">
            {t.widget.cta}
          </a>
        </div>
        <div className="rounded-[14px] bg-graphite p-6 text-white shadow-lift md:p-8">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4 text-sm text-white/60">
            <LogoMark className="h-6 w-6" />
            {t.widget.paste}
          </div>
          <pre className="mt-5 overflow-x-auto whitespace-pre-wrap break-all font-mono text-[14px] leading-relaxed">
            <span className="text-white/50">&lt;script</span>
            {'\n  '}src=<span className="text-signal">&quot;{origin}/widget.js&quot;</span>
            {'\n  '}data-company=<span className="text-signal">&quot;your-company&quot;</span>
            <span className="text-white/50">&gt;&lt;/script&gt;</span>
          </pre>
          <div className="mt-6 grid grid-cols-3 gap-3 text-sm">
            {['WordPress', 'Webflow', 'Wix'].map((p) => (
              <div key={p} className="rounded-[10px] bg-white/5 px-3 py-2.5 text-center text-white/80">
                {p}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── Fairness ───────────────────────── */

function Fairness({ t }: P) {
  return (
    <section className="bg-signal py-20 md:py-24">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 lg:grid-cols-[1fr_1.4fr]">
        <h2 className="font-display text-4xl leading-[1.05] md:text-5xl">{t.fairness.title}</h2>
        <div className="grid gap-8 sm:grid-cols-3">
          {t.fairness.items.map((i) => (
            <div key={i.t}>
              <h3 className="font-bold">{i.t}</h3>
              <p className="mt-2 leading-relaxed">{i.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── FAQ ───────────────────────── */

function Faq({ t }: P) {
  return (
    <section id="faq" className="scroll-mt-20 bg-white py-24 md:py-32">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <h2 className="font-display text-4xl leading-[1.05] md:text-5xl">{t.faq.title}</h2>
          <div className="relative mt-10 hidden h-72 lg:block">
            <Photo src="/photos/coffee.jpg" alt={t.faq.alt} className="h-full rounded-[14px]" sizes="30vw" />
          </div>
        </div>
        <div className="divide-y divide-graphite/10 border-y border-graphite/10">
          {t.faq.items.map((f) => (
            <details key={f.q} className="group py-6 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-6 text-lg font-bold">
                {f.q}
                <span className="text-2xl leading-none text-graphite-400 transition-transform group-open:rotate-45" aria-hidden="true">
                  +
                </span>
              </summary>
              <p className="mt-3 max-w-2xl leading-relaxed text-graphite-600">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── Final CTA + Footer ───────────────────────── */

function FinalCta({ t }: P) {
  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-5">
        <div className="grid overflow-hidden rounded-[18px] bg-graphite text-white lg:grid-cols-2">
          <div className="p-10 md:p-14">
            <h2 className="font-display text-4xl leading-[1.05] md:text-5xl">{t.final.title}</h2>
            <p className="mt-5 max-w-md text-lg text-white/70">{t.final.sub}</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/signup" className="btn-signal px-7 py-4 text-base">
                {t.final.cta}
              </Link>
              <Link href={`/careers/${DEMO_SLUG}`} className="btn border border-white/20 px-7 py-4 text-base text-white hover:border-white/50">
                {t.final.careers}
              </Link>
            </div>
          </div>
          <Photo src="/photos/meeting.jpg" alt={t.final.alt} className="min-h-[280px]" sizes="(min-width: 1024px) 50vw, 100vw" />
        </div>
      </div>
    </section>
  );
}

function Footer({ t, locale }: P & { locale: Locale }) {
  return (
    <footer className="border-t border-graphite/10 py-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 md:flex-row md:items-center md:justify-between">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-graphite-600">{t.footer.tagline}</p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-graphite-600">
          <a href="#how" className="hover:text-graphite">{t.nav.howItWorks}</a>
          <a href="#pricing" className="hover:text-graphite">{t.nav.pricing}</a>
          <Link href={`/careers/${DEMO_SLUG}`} className="hover:text-graphite">{t.footer.sample}</Link>
          <Link href="/login" className="hover:text-graphite">{t.nav.login}</Link>
          <LanguageSwitcher locale={locale} label={t.nav.language} />
        </nav>
        <p className="text-sm text-graphite-400">© {new Date().getFullYear()} HireKit</p>
      </div>
    </footer>
  );
}
