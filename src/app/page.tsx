import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { getOrigin } from '@/lib/company';

const DEMO_SLUG = 'northwind-labs';

export default function LandingPage() {
  return (
    <div className="overflow-x-hidden">
      <Nav />
      <Hero />
      <Steps />
      <Features />
      <EmbedShowcase origin={getOrigin()} />
      <AiSection />
      <Trust />
      <Pricing />
      <Faq />
      <FinalCta />
      <Footer />
    </div>
  );
}

/* ───────────────────────────── Nav ───────────────────────────── */

function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-paper/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm text-ink-soft md:flex">
          <a href="#how" className="hover:text-ink">How it works</a>
          <a href="#features" className="hover:text-ink">Features</a>
          <a href="#ai" className="hover:text-ink">AI screening</a>
          <a href="#pricing" className="hover:text-ink">Pricing</a>
          <a href="#faq" className="hover:text-ink">FAQ</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/login" className="hidden px-3 py-2 text-sm font-medium text-ink-soft hover:text-ink sm:block">
            Log in
          </Link>
          <Link href="/signup" className="btn-primary">
            Start free
          </Link>
        </div>
      </div>
    </header>
  );
}

/* ───────────────────────────── Hero ───────────────────────────── */

function Hero() {
  return (
    <section className="relative">
      <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_70%)]" />
      <div className="relative mx-auto max-w-6xl px-5 pb-20 pt-16 md:pt-24">
        <div className="mx-auto max-w-3xl text-center animate-float-up">
          <span className="chip border border-black/10 bg-white text-ink-soft">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Set up in under 5 minutes
          </span>
          <h1 className="mt-6 font-display text-5xl leading-[1.02] tracking-tight md:text-7xl">
            Your hiring team,
            <br />
            <em className="text-brand-600">ready to plug in.</em>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-ink-soft">
            HireKit gives any company a branded careers page, a jobs widget for its website and AI that ranks every
            applicant against your requirements. One line of code. No IT project.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/signup" className="btn-primary px-6 py-3 text-base">
              Create your hiring page
            </Link>
            <Link href={`/careers/${DEMO_SLUG}`} className="btn-ghost px-6 py-3 text-base">
              See a live careers page →
            </Link>
          </div>
          <p className="mt-4 text-xs text-ink-mute">Free for your first 3 open roles · No credit card</p>
        </div>

        <div className="relative mx-auto mt-16 max-w-5xl animate-float-up [animation-delay:150ms]">
          <ProductMock />
        </div>
      </div>
    </section>
  );
}

function ProductMock() {
  const columns = [
    {
      title: 'Applied',
      cards: [
        { name: 'Amara O.', role: 'Senior Full-Stack Engineer', score: 91, tone: 'strong' },
        { name: 'Jonas W.', role: 'Product Designer', score: 68, tone: 'possible' },
      ],
    },
    {
      title: 'Interview',
      cards: [
        { name: 'Lea M.', role: 'Customer Success Manager', score: 86, tone: 'strong' },
        { name: 'Diego R.', role: 'Data Analyst', score: 74, tone: 'possible' },
      ],
    },
    {
      title: 'Offer',
      cards: [{ name: 'Sofia K.', role: 'Senior Full-Stack Engineer', score: 94, tone: 'strong' }],
    },
  ];
  const tone: Record<string, string> = {
    strong: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    possible: 'bg-amber-50 text-amber-700 ring-amber-200',
  };

  return (
    <div className="rounded-[28px] border border-black/10 bg-white/70 p-2 shadow-lift backdrop-blur">
      <div className="rounded-[22px] border border-black/5 bg-paper">
        <div className="flex items-center gap-1.5 border-b border-black/5 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-black/10" />
          <span className="h-2.5 w-2.5 rounded-full bg-black/10" />
          <span className="h-2.5 w-2.5 rounded-full bg-black/10" />
          <span className="ml-3 truncate text-xs text-ink-mute">app.hirekit · Candidates</span>
        </div>
        <div className="grid gap-4 p-4 md:grid-cols-[1fr_1fr_1fr_1.15fr]">
          {columns.map((col) => (
            <div key={col.title} className="hidden md:block">
              <div className="mb-2 flex items-center justify-between px-1 text-xs font-semibold uppercase tracking-wide text-ink-mute">
                {col.title}
                <span className="rounded-full bg-black/5 px-2 py-0.5 text-[10px]">{col.cards.length}</span>
              </div>
              <div className="space-y-2">
                {col.cards.map((c) => (
                  <div key={c.name} className="rounded-xl border border-black/5 bg-white p-3 text-left shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">{c.name}</span>
                      <span className={`chip ring-1 ${tone[c.tone]}`}>{c.score}</span>
                    </div>
                    <p className="mt-1 text-xs text-ink-mute">{c.role}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className="rounded-2xl bg-ink p-4 text-left text-white">
            <div className="flex items-center gap-2 text-xs text-white/60">
              <SparkIcon className="h-4 w-4 text-lime-accent" /> AI screening · Amara O.
            </div>
            <div className="mt-3 flex items-end gap-2">
              <span className="font-display text-5xl leading-none">91</span>
              <span className="mb-1 text-sm text-lime-accent">Strong match</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-white/80">
              7 years building TypeScript products, led a Postgres migration at scale. Matches 5 of 5 must-haves.
            </p>
            <div className="mt-4 space-y-1.5 text-xs">
              <p className="text-white/50">Ask in interview</p>
              <p className="rounded-lg bg-white/10 px-3 py-2">How did you handle zero-downtime cut-over?</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────────── Steps ───────────────────────────── */

function Steps() {
  const steps = [
    {
      n: '01',
      title: 'Create your hiring page',
      body: 'Sign up, add your logo colour and post a role. AI drafts the job ad from a few notes if you want.',
    },
    {
      n: '02',
      title: 'Paste one line on your site',
      body: 'Your open roles and the apply form appear on your own website, styled to fit and always up to date.',
    },
    {
      n: '03',
      title: 'Review a ranked shortlist',
      body: 'Every applicant arrives scored against your must-haves, with strengths, gaps and interview questions.',
    },
  ];
  return (
    <section id="how" className="border-y border-black/5 bg-white py-24">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading eyebrow="How it works" title="From zero to hiring in an afternoon" />
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="rounded-2xl border border-black/[0.06] bg-paper p-7">
              <span className="font-display text-4xl text-brand-600">{s.n}</span>
              <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-ink-soft">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────────── Features ───────────────────────────── */

function Features() {
  const features = [
    { icon: '◧', title: 'Branded careers page', body: 'A fast, mobile-ready jobs page at your own link, in your colours.' },
    { icon: '⌘', title: 'One-line embed', body: 'Drop a script tag into WordPress, Webflow, Wix or custom code. Done.' },
    { icon: '✦', title: 'AI candidate screening', body: 'Claude reads CVs and cover letters and scores fit against your requirements.' },
    { icon: '▤', title: 'Visual pipeline', body: 'Move people from Applied to Hired on a clear board your whole team gets.' },
    { icon: '✎', title: 'AI job writer', body: 'Turn three bullet points into an inclusive, well-structured job post.' },
    { icon: '◎', title: 'Interview prep built in', body: 'Each candidate comes with targeted questions that resolve the open points.' },
  ];
  return (
    <section id="features" className="py-24">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading
          eyebrow="Everything in the kit"
          title="The hiring tools big companies have, sized for yours"
          sub="No ATS migration, no consultants. Each piece works on its own and together."
        />
        <div className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-black/[0.06] bg-black/[0.06] sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="bg-white p-8">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-lg text-brand-600">
                {f.icon}
              </span>
              <h3 className="mt-5 font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────────── Embed showcase ───────────────────────────── */

function EmbedShowcase({ origin }: { origin: string }) {
  return (
    <section className="bg-ink py-24 text-white">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 md:grid-cols-2">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-lime-accent">Plug and play</p>
          <h2 className="mt-4 font-display text-4xl leading-tight md:text-5xl">
            One line of code.
            <br />
            Your whole hiring flow.
          </h2>
          <p className="mt-5 max-w-md text-white/70">
            Paste the snippet where you want your jobs to appear. Candidates browse roles and apply without leaving your
            site, and every application lands in your HireKit pipeline already screened.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="/demo.html" className="btn bg-white text-ink hover:bg-white/90">
              See it on a demo website →
            </a>
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-2">
          <div className="flex items-center justify-between rounded-t-xl px-4 py-2 text-xs text-white/50">
            <span>index.html</span>
            <span>Works with any website</span>
          </div>
          <pre className="overflow-x-auto rounded-xl bg-black/40 p-5 text-[13px] leading-relaxed">
            <code>
              <span className="text-white/40">{'<!-- Your careers section -->'}</span>
              {'\n'}
              <span className="text-sky-300">{'<script'}</span>
              {'\n  '}
              <span className="text-lime-accent">src</span>=<span className="text-amber-200">{`"${origin}/widget.js"`}</span>
              {'\n  '}
              <span className="text-lime-accent">data-company</span>=<span className="text-amber-200">{'"your-company"'}</span>
              <span className="text-sky-300">{'>'}</span>
              <span className="text-sky-300">{'</script>'}</span>
            </code>
          </pre>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────────── AI ───────────────────────────── */

function AiSection() {
  return (
    <section id="ai" className="py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 md:grid-cols-2">
        <div className="order-2 md:order-1">
          <div className="card p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-ink-mute">Customer Success Manager</p>
                <p className="mt-1 text-lg font-semibold">Lea M.</p>
              </div>
              <div className="text-right">
                <p className="font-display text-5xl leading-none text-emerald-600">86</p>
                <p className="text-xs font-medium text-emerald-700">Strong match</p>
              </div>
            </div>
            <div className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <p className="font-semibold text-emerald-700">Strengths</p>
                <ul className="mt-2 space-y-1.5 text-ink-soft">
                  <li>• 4 years owning B2B SaaS accounts</li>
                  <li>• Cut churn 18% with onboarding playbooks</li>
                  <li>• Fluent German and English</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-amber-700">To explore</p>
                <ul className="mt-2 space-y-1.5 text-ink-soft">
                  <li>• No logistics industry exposure</li>
                  <li>• Salesforce level unclear</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="order-1 md:order-2">
          <SectionHeading
            align="left"
            eyebrow="AI screening"
            title="Read 200 applications in the time it takes to read one"
            sub="You set the must-haves. HireKit reads each CV and cover letter, scores fit from 0 to 100 and explains why, so your team spends time on the right conversations."
          />
          <ul className="mt-8 space-y-3 text-ink-soft">
            <Check>Scores each person against your own requirements</Check>
            <Check>Names, age, gender and nationality are ignored by design</Check>
            <Check>Suggests interview questions for every open point</Check>
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────────── Trust ───────────────────────────── */

function Trust() {
  const items = [
    { title: 'Humans decide', body: 'AI suggests, your team decides. Nobody is rejected automatically.' },
    { title: 'GDPR-minded', body: 'Explicit applicant consent, private CV storage and short-lived download links.' },
    { title: 'Your data stays yours', body: 'Row-level security isolates every company. Export or delete anytime.' },
  ];
  return (
    <section className="border-y border-black/5 bg-paper-warm py-20">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading eyebrow="Responsible by default" title="Built for European hiring rules" />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {items.map((i) => (
            <div key={i.title} className="rounded-2xl bg-white p-7 shadow-card">
              <h3 className="font-semibold">{i.title}</h3>
              <p className="mt-2 text-sm text-ink-soft">{i.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────────── Pricing ───────────────────────────── */

function Pricing() {
  const plans = [
    {
      name: 'Starter',
      price: '€0',
      period: 'forever',
      body: 'For your first hires.',
      features: ['3 open roles', 'Careers page + widget', '50 AI screenings / month', 'Pipeline board'],
      cta: 'Start free',
      highlight: false,
    },
    {
      name: 'Growth',
      price: '€79',
      period: 'per month',
      body: 'For teams hiring every month.',
      features: ['Unlimited roles', 'Unlimited AI screenings', 'AI job writer', 'Custom brand colours', 'Priority support'],
      cta: 'Start 14-day trial',
      highlight: true,
    },
    {
      name: 'Agency',
      price: 'Custom',
      period: '',
      body: 'For recruiters running many clients.',
      features: ['Multiple client workspaces', 'White-label careers pages', 'API access', 'Dedicated onboarding'],
      cta: 'Talk to us',
      highlight: false,
    },
  ];
  return (
    <section id="pricing" className="py-24">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading eyebrow="Pricing" title="Simple plans that grow with your team" />
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {plans.map((p) => (
            <div
              key={p.name}
              className={
                p.highlight
                  ? 'relative rounded-3xl bg-ink p-8 text-white shadow-lift'
                  : 'rounded-3xl border border-black/[0.06] bg-white p-8'
              }
            >
              {p.highlight && (
                <span className="chip absolute -top-3 left-8 bg-lime-accent text-ink">Most popular</span>
              )}
              <h3 className="font-semibold">{p.name}</h3>
              <p className={p.highlight ? 'mt-1 text-sm text-white/60' : 'mt-1 text-sm text-ink-mute'}>{p.body}</p>
              <p className="mt-6">
                <span className="font-display text-5xl">{p.price}</span>{' '}
                <span className={p.highlight ? 'text-sm text-white/60' : 'text-sm text-ink-mute'}>{p.period}</span>
              </p>
              <ul className="mt-6 space-y-2.5 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span className={p.highlight ? 'text-lime-accent' : 'text-brand-600'}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className={p.highlight ? 'btn mt-8 w-full bg-white text-ink hover:bg-white/90' : 'btn-ghost mt-8 w-full'}
              >
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────────── FAQ ───────────────────────────── */

function Faq() {
  const faqs = [
    {
      q: 'Do I need a developer to install it?',
      a: 'No. If you can edit a page on your website, you can paste the snippet. You can also just share your HireKit careers link.',
    },
    {
      q: 'Will the AI reject candidates automatically?',
      a: 'Never. It scores and explains fit so your team can prioritise. Every decision to move or reject a candidate is made by a person.',
    },
    {
      q: 'How does the AI decide the score?',
      a: 'It compares the CV and cover letter with the must-have requirements you write for each role, and shows its reasoning as strengths, gaps and questions.',
    },
    {
      q: 'Where is applicant data stored?',
      a: 'In an isolated Postgres database with row-level security. CVs live in private storage and are only shared through links that expire after an hour.',
    },
    {
      q: 'Can I use it for several companies?',
      a: 'Yes. The Agency plan gives every client their own workspace, careers page and widget.',
    },
  ];
  return (
    <section id="faq" className="border-t border-black/5 bg-white py-24">
      <div className="mx-auto max-w-3xl px-5">
        <SectionHeading eyebrow="FAQ" title="Questions, answered" />
        <div className="mt-12 divide-y divide-black/[0.06] rounded-2xl border border-black/[0.06]">
          {faqs.map((f) => (
            <details key={f.q} className="group p-6 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
                {f.q}
                <span className="text-xl text-ink-mute transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-ink-soft">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────────── CTA + Footer ───────────────────────────── */

function FinalCta() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-5">
        <div className="relative overflow-hidden rounded-[32px] bg-brand-600 px-8 py-16 text-center text-white md:py-20">
          <div className="bg-grid absolute inset-0 opacity-20" />
          <div className="relative">
            <h2 className="font-display text-4xl md:text-6xl">Your next great hire is applying somewhere.</h2>
            <p className="mx-auto mt-4 max-w-lg text-white/80">
              Make it easy for them to find you. Set up HireKit in five minutes, free.
            </p>
            <Link href="/signup" className="btn mt-8 bg-white px-6 py-3 text-base text-ink hover:bg-white/90">
              Create your hiring page
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-black/5 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 text-sm text-ink-mute md:flex-row">
        <Logo />
        <div className="flex gap-6">
          <a href="#features" className="hover:text-ink">Features</a>
          <a href="#pricing" className="hover:text-ink">Pricing</a>
          <Link href={`/careers/${DEMO_SLUG}`} className="hover:text-ink">Live demo</Link>
          <Link href="/login" className="hover:text-ink">Log in</Link>
        </div>
        <p>© {new Date().getFullYear()} HireKit</p>
      </div>
    </footer>
  );
}

/* ───────────────────────────── Bits ───────────────────────────── */

function SectionHeading({
  eyebrow,
  title,
  sub,
  align = 'center',
}: {
  eyebrow: string;
  title: string;
  sub?: string;
  align?: 'center' | 'left';
}) {
  return (
    <div className={align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-xl'}>
      <p className="text-sm font-semibold uppercase tracking-widest text-brand-600">{eyebrow}</p>
      <h2 className="mt-3 font-display text-4xl leading-tight tracking-tight md:text-5xl">{title}</h2>
      {sub && <p className="mt-4 text-lg text-ink-soft">{sub}</p>}
    </div>
  );
}

function Check({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-emerald-100 text-xs text-emerald-700">
        ✓
      </span>
      {children}
    </li>
  );
}

function SparkIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2l1.9 5.6L19.5 9.5l-5.6 1.9L12 17l-1.9-5.6L4.5 9.5l5.6-1.9L12 2zm7 12l.9 2.6 2.6.9-2.6.9L19 21l-.9-2.6-2.6-.9 2.6-.9L19 14z" />
    </svg>
  );
}
