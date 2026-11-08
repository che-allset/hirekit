'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { Dict } from '@/i18n';
import { fmt } from '@/i18n';
import type { Interview, MeetingType } from '@/lib/types';
import { cancelInterview, getSuggestedSlots, scheduleInterview, type ScheduleResult } from './schedule-actions';

type T = Dict['dash']['schedule'];

export function SchedulePanel({
  applicationId,
  candidateEmail,
  connected,
  interviews,
  locale,
  t,
}: {
  applicationId: string;
  candidateEmail: string;
  connected: { google: boolean; microsoft: boolean; zoom: boolean };
  interviews: Interview[];
  locale: string;
  t: T;
}) {
  const router = useRouter();
  const tz = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC', []);
  const hasCalendar = connected.google || connected.microsoft;

  const types: { key: MeetingType; label: string; enabled: boolean }[] = [
    { key: 'google_meet', label: 'Google Meet', enabled: connected.google },
    { key: 'teams', label: 'Microsoft Teams', enabled: connected.microsoft },
    { key: 'zoom', label: 'Zoom', enabled: connected.zoom },
    { key: 'custom', label: t.otherLink, enabled: true },
  ];
  const [meetingType, setMeetingType] = useState<MeetingType>(types.find((x) => x.enabled)!.key);
  const [duration, setDuration] = useState(30);
  const [slots, setSlots] = useState<string[] | null>(hasCalendar ? null : []);
  const [slotError, setSlotError] = useState<string | null>(null);
  const [start, setStart] = useState<string | null>(null);
  const [manual, setManual] = useState('');
  const [customLink, setCustomLink] = useState('');
  const [note, setNote] = useState('');
  const [result, setResult] = useState<ScheduleResult | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!hasCalendar) return;
    let alive = true;
    setSlots(null);
    getSuggestedSlots({ tz, durationMin: duration }).then((res) => {
      if (!alive) return;
      setSlots(res.slots);
      setSlotError(('error' in res && res.error) || null);
    });
    return () => {
      alive = false;
    };
  }, [duration, hasCalendar, tz]);

  const slotFmt = new Intl.DateTimeFormat(locale, { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  const fullFmt = new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' });
  const chosen = start ?? (manual ? new Date(manual).toISOString() : null);

  const submit = () => {
    if (!chosen) return;
    setResult(null);
    startTransition(async () => {
      const res = await scheduleInterview({ applicationId, start: chosen, durationMin: duration, meetingType, customLink, note, tz });
      setResult(res);
      if (res.ok) {
        setStart(null);
        setManual('');
        setNote('');
        router.refresh();
      }
    });
  };

  const downloadIcs = (ics: string) => {
    const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'interview.ics';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const upcoming = interviews.filter((i) => i.status === 'scheduled');
  const typeLabel = (k: MeetingType) => types.find((x) => x.key === k)?.label ?? k;

  return (
    <section id="schedule" className="card scroll-mt-24 p-6">
      <div className="flex items-center gap-2">
        <span aria-hidden="true">📅</span>
        <h2 className="font-semibold">{t.title}</h2>
      </div>
      <p className="mt-1 text-sm text-ink-soft">{fmt(t.sub, { email: candidateEmail })}</p>

      {upcoming.length > 0 && (
        <ul className="mt-4 space-y-2">
          {upcoming.map((iv) => (
            <li key={iv.id} className="rounded-xl bg-emerald-50 px-4 py-3 text-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-emerald-900">{fullFmt.format(new Date(iv.starts_at))}</p>
                  <p className="text-emerald-800">
                    {typeLabel(iv.meeting_type)} · {iv.duration_min} min
                  </p>
                  {iv.join_url && (
                    <a href={iv.join_url} target="_blank" rel="noreferrer" className="mt-1 inline-block break-all text-emerald-700 underline">
                      {t.joinLink}
                    </a>
                  )}
                </div>
                <button
                  type="button"
                  className="text-xs text-emerald-800 hover:text-rose-700"
                  onClick={() =>
                    startTransition(async () => {
                      await cancelInterview(iv.id);
                      router.refresh();
                    })
                  }
                >
                  {t.cancel}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <fieldset className="mt-5">
        <legend className="text-sm font-semibold">{t.how}</legend>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {types.map((x) => (
            <button
              key={x.key}
              type="button"
              disabled={!x.enabled}
              onClick={() => setMeetingType(x.key)}
              className={cn(
                'rounded-xl border px-3 py-2 text-left text-sm font-medium transition',
                meetingType === x.key ? 'border-ink bg-ink text-white' : 'border-black/10 bg-white hover:border-black/30',
                !x.enabled && 'cursor-not-allowed opacity-40 hover:border-black/10',
              )}
            >
              {x.label}
            </button>
          ))}
        </div>
        {!(connected.google && connected.microsoft && connected.zoom) && (
          <p className="mt-2 text-xs text-ink-mute">
            {t.connectHint}{' '}
            <Link href="/dashboard/settings#integrations" className="font-semibold text-ink underline">
              {t.connectLink}
            </Link>
          </p>
        )}
        {meetingType === 'custom' && (
          <input
            type="url"
            value={customLink}
            onChange={(e) => setCustomLink(e.target.value)}
            placeholder={t.linkPlaceholder}
            className="input mt-3"
          />
        )}
      </fieldset>

      <div className="mt-5">
        <label className="text-sm font-semibold" htmlFor="duration">
          {t.duration}
        </label>
        <select id="duration" value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="input mt-2">
          {[15, 30, 45, 60, 90].map((d) => (
            <option key={d} value={d}>
              {d} min
            </option>
          ))}
        </select>
      </div>

      <div className="mt-5">
        <p className="text-sm font-semibold">{t.when}</p>
        {hasCalendar ? (
          <>
            <p className="mt-1 text-xs text-ink-mute">{fmt(t.freeFrom, { name: connected.google ? 'Google Calendar' : 'Outlook' })}</p>
            {slots === null ? (
              <p className="mt-2 text-sm text-ink-mute">{t.loadingSlots}</p>
            ) : slots.length ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {slots.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setStart(s === start ? null : s);
                      setManual('');
                    }}
                    className={cn(
                      'rounded-full border px-3 py-1.5 text-sm transition',
                      start === s ? 'border-ink bg-ink text-white' : 'border-black/10 bg-white hover:border-black/30',
                    )}
                  >
                    {slotFmt.format(new Date(s))}
                  </button>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-ink-mute">{slotError ?? t.noSlots}</p>
            )}
          </>
        ) : (
          <p className="mt-1 text-xs text-ink-mute">{t.noCalendar}</p>
        )}
        <label className="mt-3 block text-xs text-ink-mute" htmlFor="manual-time">
          {hasCalendar ? t.orPick : t.pick}
        </label>
        <input
          id="manual-time"
          type="datetime-local"
          value={manual}
          onChange={(e) => {
            setManual(e.target.value);
            setStart(null);
          }}
          className="input mt-1"
        />
      </div>

      <div className="mt-5">
        <label className="text-sm font-semibold" htmlFor="note">
          {t.note}
        </label>
        <textarea id="note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder={t.notePlaceholder} className="input mt-2" />
      </div>

      {result?.error && <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-800">{result.error}</p>}
      {result?.ok && (
        <div className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          <p className="font-semibold">{result.invited ? fmt(t.sent, { email: candidateEmail }) : t.created}</p>
          {result.joinUrl && (
            <a href={result.joinUrl} target="_blank" rel="noreferrer" className="mt-1 block break-all underline">
              {result.joinUrl}
            </a>
          )}
          {!result.invited && (
            <div className="mt-3 flex flex-wrap gap-2">
              {result.mailto && (
                <a href={result.mailto} className="btn-primary px-3 py-1.5 text-xs">
                  {t.emailCandidate}
                </a>
              )}
              {result.ics && (
                <button type="button" onClick={() => downloadIcs(result.ics!)} className="btn-ghost px-3 py-1.5 text-xs">
                  {t.downloadIcs}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      <button type="button" disabled={!chosen || pending} onClick={submit} className="btn-primary mt-5 w-full disabled:opacity-50">
        {pending ? t.sending : hasCalendar ? t.send : t.create}
      </button>
      {chosen && <p className="mt-2 text-center text-xs text-ink-mute">{fullFmt.format(new Date(chosen))}</p>}
    </section>
  );
}
