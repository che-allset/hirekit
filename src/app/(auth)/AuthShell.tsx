import { Logo } from '@/components/Logo';

export function AuthShell({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col px-6 py-8 sm:px-12">
        <Logo />
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
          <h1 className="font-display text-4xl tracking-tight">{title}</h1>
          <p className="mt-2 text-ink-soft">{sub}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
      <div className="relative hidden overflow-hidden bg-ink p-12 text-white lg:flex lg:flex-col lg:justify-end">
        <div className="bg-grid absolute inset-0 opacity-10" />
        <div className="relative max-w-md">
          <p className="font-display text-4xl leading-tight">
            Hiring that fits into the website you already have.
          </p>
          <p className="mt-4 text-sm text-white/60">Careers page, embeddable widget, AI screening and pipeline in one kit.</p>
          <div className="mt-10 grid grid-cols-3 gap-4 text-sm">
            <Stat n="5 min" l="to go live" />
            <Stat n="1 line" l="to embed" />
            <Stat n="0" l="auto-rejections" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="font-display text-2xl text-lime-accent">{n}</p>
      <p className="mt-1 text-white/60">{l}</p>
    </div>
  );
}
