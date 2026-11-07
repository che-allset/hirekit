import Link from 'next/link';
import { Logo, LogoMark } from '@/components/Logo';
import { Photo } from '@/components/landing/Photo';
import { IntroFilm, SalesVideo } from '@/components/landing/Videos';
import { Pricing } from '@/components/landing/Pricing';
import { getOrigin } from '@/lib/company';

const DEMO_SLUG = 'northwind-labs';

export default function LandingPage() {
  const origin = getOrigin();
  return (
    <div className="overflow-x-hidden">
      <Nav />
      <main>
        <Hero />
        <PhotoBand />
        <Problem />
        <Steps />
        <Screening />
        <Widget origin={origin} />
        <Fairness />
        <section id="pricing" className="scroll-mt-20 py-24 md:py-32">
          <div className="mx-auto max-w-6xl px-5">
            <Pricing />
          </div>
        </section>
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}

/* ───────────────────────── Nav ───────────────────────── */

function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-graphite/10 bg-steel/90 backdrop-blur">
      <div className="mx-auto flex h-[68px] max-w-6xl items-center justify-between px-5">
        <Logo />
        <nav aria-label="Main" className="hidden items-center gap-8 text-[15px] text-graphite-600 md:flex">
          <a href="#how" className="hover:text-graphite">How it works</a>
          <a href="#screening" className="hover:text-graphite">Screening</a>
          <a href="#pricing" className="hover:text-graphite">Pricing</a>
          <a href="#faq" className="hover:text-graphite">Questions</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/login" className="hidden px-3 py-2 text-[15px] font-bold text-graphite-600 hover:text-graphite sm:block">
            Log in
          </Link>
          <Link href="/signup" className="btn-signal py-2.5">
            Start hiring
          </Link>
        </div>
      </div>
    </header>
  );
}

/* ───────────────────────── Hero ───────────────────────── */

function Hero() {
  return (
    <section className="relative">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-14 md:pt-20 lg:grid-cols-[1fr_1.08fr] lg:gap-14">
        <div className="hero-in">
          <h1 className="font-display text-[56px] leading-[0.92] sm:text-7xl lg:text-[84px]">
            Hire your next people without an HR department.
          </h1>
          <p className="mt-7 max-w-[34rem] text-lg leading-relaxed text-graphite-600 md:text-xl">
            HireKit gives your company a careers page, a jobs widget for the website you already have, and an assistant
            that reads every application against your requirements.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/signup" className="btn-signal px-7 py-4 text-base">
              Start hiring free
            </Link>
            <a href="#tour" className="btn-ghost px-7 py-4 text-base">
              Watch the tour (1:26)
            </a>
          </div>
          <p className="mt-4 text-sm text-graphite-400">Free for up to 3 open roles. No card needed.</p>
        </div>

        <div className="hero-in relative [animation-delay:120ms]">
          <div className="absolute -right-5 -top-5 hidden h-[78%] w-[82%] rounded-[18px] bg-signal sm:block" aria-hidden="true" />
          <div className="relative rounded-[18px] bg-graphite p-2 shadow-lift">
            <IntroFilm />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── Photos ───────────────────────── */

function PhotoBand() {
  return (
    <section aria-label="Teams using HireKit" className="mx-auto max-w-6xl px-5">
      <div className="grid gap-3 md:grid-cols-[1.5fr_1fr] md:grid-rows-2">
        <div className="relative md:row-span-2">
          <Photo src="/photos/team.jpg" alt="A small team planning work around a table" className="h-80 rounded-[14px] md:h-full" priority />
          <div className="absolute bottom-5 left-5 max-w-[18rem] rounded-[12px] bg-white p-4 shadow-lift">
            <div className="flex items-center justify-between gap-6">
              <p className="font-bold">Lea Müller</p>
              <span className="chip bg-forest text-white">86</span>
            </div>
            <p className="mt-1 text-sm text-graphite-600">Customer Success Manager</p>
            <p className="mt-3 text-sm leading-snug">Owned 35 accounts and cut churn by 18%. Meets all four requirements.</p>
          </div>
        </div>
        <Photo src="/photos/interview.jpg" alt="Colleagues working through documents at a table" className="h-64 rounded-[14px]" sizes="(min-width: 768px) 40vw, 100vw" />
        <Photo src="/photos/laughing.jpg" alt="A team smiling around a laptop" className="h-64 rounded-[14px]" sizes="(min-width: 768px) 40vw, 100vw" />
      </div>
    </section>
  );
}

/* ───────────────────────── Problem + VSL ───────────────────────── */

function Problem() {
  return (
    <section id="tour" className="mt-24 scroll-mt-20 bg-graphite py-24 text-white md:mt-32 md:py-32">
      <div className="mx-auto grid max-w-6xl gap-14 px-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <h2 className="font-display text-5xl leading-[0.95] md:text-6xl">Good candidates don't wait in your inbox.</h2>
          <div className="mt-8 space-y-5 text-lg leading-relaxed text-white/75">
            <p>
              Most small companies hire from a shared email address. Applications pile up, the owner reads them at night,
              and the best people have accepted another offer by Friday.
            </p>
            <p>
              HireKit puts every application in one place, reads it the moment it arrives and tells you who to call first.
            </p>
          </div>
        </div>
        <SalesVideo />
      </div>
    </section>
  );
}

/* ───────────────────────── Steps ───────────────────────── */

function Steps() {
  const steps = [
    { title: 'Post a role', body: 'Add a title and a few notes. HireKit drafts the job ad and the must-have list for you to edit.' },
    { title: 'Plug it into your site', body: 'Paste one line where your jobs should appear, or share your careers page link.' },
    { title: 'Read a ranked shortlist', body: 'Every application arrives scored against your must-haves, with what to ask in the interview.' },
    { title: 'Hire', body: 'Move people from Applied to Hired on one board. Your whole team sees the same picture.' },
  ];
  return (
    <section id="how" className="scroll-mt-20 py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-5">
        <h2 className="max-w-2xl font-display text-5xl leading-[0.95] md:text-6xl">From open role to signed offer in four steps.</h2>
        <div className="relative mt-16">
          <div className="absolute left-0 right-0 top-[22px] hidden h-[3px] bg-graphite md:block" aria-hidden="true" />
          <ol className="relative grid gap-10 md:grid-cols-4 md:gap-6">
          {steps.map((s, i) => (
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

function Screening() {
  return (
    <section id="screening" className="scroll-mt-20 bg-white py-24 md:py-32">
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 lg:grid-cols-2">
        <div className="relative">
          <Photo src="/photos/resume.jpg" alt="A team going through notes and laptops at a table" className="h-[420px] rounded-[14px] md:h-[520px]" />
          <div className="absolute -bottom-8 right-4 w-[min(92%,24rem)] rounded-[14px] border border-graphite/10 bg-white p-6 shadow-lift sm:-right-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-graphite-600">Senior Full-Stack Engineer</p>
                <p className="mt-0.5 text-lg font-bold">Amara Okafor</p>
              </div>
              <div className="text-right">
                <p className="font-display text-5xl leading-none text-forest">92</p>
                <p className="text-xs font-bold text-forest">Strong match</p>
              </div>
            </div>
            <ul className="mt-5 space-y-2 text-sm">
              <li className="flex gap-2"><Dot className="bg-forest" />Led a zero-downtime Postgres migration</li>
              <li className="flex gap-2"><Dot className="bg-forest" />7 years of TypeScript, front and back</li>
              <li className="flex gap-2"><Dot className="bg-signal-600" />No logistics experience mentioned</li>
            </ul>
            <p className="mt-5 rounded-[10px] bg-steel-50 p-3 text-sm">
              <span className="font-bold">Ask:</span> How did you plan the cut-over without downtime?
            </p>
          </div>
        </div>
        <div className="lg:pl-6">
          <h2 className="font-display text-5xl leading-[0.95] md:text-6xl">Read 200 applications in the time it takes to read one.</h2>
          <p className="mt-6 text-lg leading-relaxed text-graphite-600">
            You write the must-haves for each role. HireKit reads every CV and cover letter against them, scores the fit
            from 0 to 100 and explains its reasoning in plain language.
          </p>
          <dl className="mt-10 grid gap-6 sm:grid-cols-2">
            <div>
              <dt className="font-bold">Reads the actual CV</dt>
              <dd className="mt-1 text-graphite-600">PDF CVs are read in full, not just keyword-matched.</dd>
            </div>
            <div>
              <dt className="font-bold">Shows its working</dt>
              <dd className="mt-1 text-graphite-600">Strengths, gaps and the questions worth asking.</dd>
            </div>
            <div>
              <dt className="font-bold">Flags thin applications</dt>
              <dd className="mt-1 text-graphite-600">Unverified claims score low until you have evidence.</dd>
            </div>
            <div>
              <dt className="font-bold">Writes your job ads</dt>
              <dd className="mt-1 text-graphite-600">Three notes in, an inclusive job post out.</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}

function Dot({ className }: { className: string }) {
  return <span className={`mt-1.5 h-2 w-2 flex-none rounded-full ${className}`} aria-hidden="true" />;
}

/* ───────────────────────── Widget ───────────────────────── */

function Widget({ origin }: { origin: string }) {
  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <h2 className="font-display text-5xl leading-[0.95] md:text-6xl">One line on your website. Your whole hiring flow behind it.</h2>
          <p className="mt-6 text-lg leading-relaxed text-graphite-600">
            Paste the snippet into WordPress, Wix, Webflow or your own code. Your open roles and the application form
            appear on your site, in your colours, and stay up to date on their own.
          </p>
          <a href="/demo.html" className="btn-primary mt-8">
            See it on a sample company site
          </a>
        </div>
        <div className="rounded-[14px] bg-graphite p-6 text-white shadow-lift md:p-8">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4 text-sm text-white/60">
            <LogoMark className="h-6 w-6" />
            Paste this where your jobs should appear
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

function Fairness() {
  return (
    <section className="bg-signal py-20 md:py-24">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 lg:grid-cols-[1fr_1.4fr]">
        <h2 className="font-display text-5xl leading-[0.95] md:text-6xl">The assistant advises. People decide.</h2>
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <h3 className="font-bold">Nobody is rejected by software</h3>
            <p className="mt-2 leading-relaxed">Every stage change is made by someone on your team. Recruiting AI is high-risk under the EU AI Act, and HireKit is built that way from day one.</p>
          </div>
          <div>
            <h3 className="font-bold">Personal details are ignored</h3>
            <p className="mt-2 leading-relaxed">Name, age, gender and nationality play no part in the score. Only the requirements you wrote do.</p>
          </div>
          <div>
            <h3 className="font-bold">Data stays private</h3>
            <p className="mt-2 leading-relaxed">Applicants give consent, CVs sit in private storage and links to them expire after an hour.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── FAQ ───────────────────────── */

function Faq() {
  const faqs = [
    { q: 'Do I need a developer to set it up?', a: 'No. If you can edit a page on your website, you can paste the snippet. If you can’t, share your HireKit careers page link instead.' },
    { q: 'How is the score worked out?', a: 'HireKit compares each CV and cover letter with the must-haves you wrote for that role, then shows strengths, gaps and suggested questions so you can check its reasoning.' },
    { q: 'What do candidates see?', a: 'Your careers page or your own website, in your colours. A three-step application that works on a phone, then a confirmation. They never need an account.' },
    { q: 'Where is applicant data stored?', a: 'In a Postgres database with row-level security, so each company only ever sees its own applicants. CVs are private files shared through links that expire after an hour.' },
    { q: 'Can I cancel?', a: 'Yes, from your dashboard. Your careers page goes offline at the end of the billing period and you can export your candidates first.' },
  ];
  return (
    <section id="faq" className="scroll-mt-20 bg-white py-24 md:py-32">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <h2 className="font-display text-5xl leading-[0.95] md:text-6xl">Questions before you start.</h2>
          <div className="relative mt-10 hidden h-72 lg:block">
            <Photo src="/photos/coffee.jpg" alt="Colleagues talking over coffee and laptops" className="h-full rounded-[14px]" sizes="30vw" />
          </div>
        </div>
        <div className="divide-y divide-graphite/10 border-y border-graphite/10">
          {faqs.map((f) => (
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

function FinalCta() {
  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-5">
        <div className="grid overflow-hidden rounded-[18px] bg-graphite text-white lg:grid-cols-2">
          <div className="p-10 md:p-14">
            <h2 className="font-display text-5xl leading-[0.95] md:text-6xl">Post your first role today.</h2>
            <p className="mt-5 max-w-md text-lg text-white/70">
              Your careers page is live the moment you sign up, and the first application gets screened in seconds.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/signup" className="btn-signal px-7 py-4 text-base">
                Start hiring free
              </Link>
              <Link href={`/careers/${DEMO_SLUG}`} className="btn border border-white/20 px-7 py-4 text-base text-white hover:border-white/50">
                See a live careers page
              </Link>
            </div>
          </div>
          <Photo src="/photos/meeting.jpg" alt="A team meeting around a table with laptops" className="min-h-[280px]" sizes="(min-width: 1024px) 50vw, 100vw" />
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-graphite/10 py-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 md:flex-row md:items-center md:justify-between">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-graphite-600">Hiring for companies without an HR department.</p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-graphite-600">
          <a href="#how" className="hover:text-graphite">How it works</a>
          <a href="#pricing" className="hover:text-graphite">Pricing</a>
          <Link href={`/careers/${DEMO_SLUG}`} className="hover:text-graphite">Sample careers page</Link>
          <Link href="/login" className="hover:text-graphite">Log in</Link>
        </nav>
        <p className="text-sm text-graphite-400">© {new Date().getFullYear()} HireKit</p>
      </div>
    </footer>
  );
}
