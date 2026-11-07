import type { Verdict } from '@/lib/types';
import { cn } from '@/lib/utils';
import { getDict } from '@/i18n/server';

export function PageHeader({
  title,
  sub,
  action,
}: {
  title: string;
  sub?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-4xl tracking-tight">{title}</h1>
        {sub && <p className="mt-1 text-ink-soft">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

const VERDICT_STYLE: Record<Verdict, { label: string; cls: string; text: string }> = {
  strong: { label: 'Strong match', cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200', text: 'text-emerald-600' },
  possible: { label: 'Possible match', cls: 'bg-amber-50 text-amber-700 ring-amber-200', text: 'text-amber-600' },
  weak: { label: 'Weak match', cls: 'bg-rose-50 text-rose-700 ring-rose-200', text: 'text-rose-600' },
};

export function verdictStyle(v: Verdict | null) {
  return v ? VERDICT_STYLE[v] : null;
}

export function ScoreBadge({
  score,
  verdict,
  status,
  showLabel = false,
}: {
  score: number | null;
  verdict: Verdict | null;
  status: 'pending' | 'done' | 'failed';
  showLabel?: boolean;
}) {
  const { t } = getDict();
  if (status === 'pending') return <span className="chip bg-black/5 text-ink-mute ring-1 ring-black/5">{t.dash.screeningPending}</span>;
  if (status === 'failed' || score === null || !verdict)
    return <span className="chip bg-black/5 text-ink-mute ring-1 ring-black/5">{t.dash.notScored}</span>;
  const s = VERDICT_STYLE[verdict];
  return (
    <span className={cn('chip ring-1', s.cls)}>
      <span className="font-semibold tabular-nums">{score}</span>
      {showLabel && <span>· {t.dash.verdicts[verdict]}</span>}
    </span>
  );
}

export function StatCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="card p-5">
      <p className="text-sm text-ink-mute">{label}</p>
      <p className="mt-2 font-display text-4xl tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-mute">{hint}</p>}
    </div>
  );
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-black/10 bg-white px-6 py-14 text-center">
      <p className="font-semibold">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-sm text-ink-mute">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
