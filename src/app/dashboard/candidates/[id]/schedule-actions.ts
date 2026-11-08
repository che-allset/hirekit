'use server';

import { revalidatePath } from 'next/cache';
import { requireCompany } from '@/lib/company';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  busyTimes,
  createCalendarEvent,
  createZoomMeeting,
  deleteCalendarEvent,
  deleteZoomMeeting,
  listConnections,
  type CalendarProvider,
} from '@/lib/integrations';
import { buildIcs } from '@/lib/ics';
import { safeUrl } from '@/lib/utils';
import type { Interview, MeetingType } from '@/lib/types';
import { DICTS, fmt } from '@/i18n';
import { getLocale } from '@/i18n/server';

const MEETING_TYPES: MeetingType[] = ['google_meet', 'teams', 'zoom', 'custom'];
const DURATIONS = [15, 30, 45, 60, 90];

function validTz(tz: string) {
  try {
    new Intl.DateTimeFormat('en', { timeZone: tz });
    return tz;
  } catch {
    return 'UTC';
  }
}

async function connectedCalendar(companyId: string, prefer?: CalendarProvider): Promise<CalendarProvider | null> {
  const conns = (await listConnections(companyId)).map((c) => c.provider);
  if (prefer && conns.includes(prefer)) return prefer;
  if (conns.includes('google')) return 'google';
  if (conns.includes('microsoft')) return 'microsoft';
  return null;
}

/** Up to 12 free slots on working days, 09:00–17:00 in the recruiter's time zone, over the next week. */
export async function getSuggestedSlots(input: { tz: string; durationMin: number }) {
  const { company } = await requireCompany();
  const cal = await connectedCalendar(company.id);
  if (!cal) return { calendar: null, slots: [] as string[] };

  const tz = validTz(input.tz);
  const duration = DURATIONS.includes(input.durationMin) ? input.durationMin : 30;
  const step = 30 * 60_000;
  const from = new Date(Math.ceil((Date.now() + 2 * 3600_000) / step) * step);
  const to = new Date(from.getTime() + 8 * 864e5);

  let busy: { start: number; end: number }[] = [];
  try {
    busy = (await busyTimes(company.id, cal, from.toISOString(), to.toISOString())).map((b) => ({
      start: new Date(b.start).getTime(),
      end: new Date(b.end).getTime(),
    }));
  } catch (err) {
    console.error('Free/busy lookup failed', err);
    return { calendar: cal, slots: [] as string[], error: DICTS[getLocale()].dash.schedule.errors.calendar };
  }

  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: tz, weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false });
  const perDay = new Map<string, number>();
  const dayKey = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' });
  const slots: string[] = [];
  for (let t = from.getTime(); t < to.getTime() && slots.length < 12; t += step) {
    const p = Object.fromEntries(parts.formatToParts(new Date(t)).map((x) => [x.type, x.value]));
    if (p.weekday === 'Sat' || p.weekday === 'Sun') continue;
    const minutes = Number(p.hour) * 60 + Number(p.minute);
    if (minutes < 9 * 60 || minutes + duration > 17 * 60) continue;
    const end = t + duration * 60_000;
    if (busy.some((b) => b.start < end && b.end > t)) continue;
    const day = dayKey.format(new Date(t));
    const n = perDay.get(day) ?? 0;
    if (n >= 3) continue; // spread suggestions across days
    // Prefer round hours and half hours spaced apart within a day.
    if (n > 0 && slots.length && t - new Date(slots[slots.length - 1]!).getTime() < 90 * 60_000 && dayKey.format(new Date(slots[slots.length - 1]!)) === day) continue;
    perDay.set(day, n + 1);
    slots.push(new Date(t).toISOString());
  }
  return { calendar: cal, slots };
}

export interface ScheduleResult {
  ok?: boolean;
  error?: string;
  joinUrl?: string | null;
  invited?: boolean;
  ics?: string;
  mailto?: string;
}

export async function scheduleInterview(input: {
  applicationId: string;
  start: string;
  durationMin: number;
  meetingType: string;
  customLink?: string;
  note?: string;
  tz: string;
}): Promise<ScheduleResult> {
  const { supabase, company, user } = await requireCompany();
  const locale = getLocale();
  const t = DICTS[locale].dash.schedule;

  const meetingType = MEETING_TYPES.includes(input.meetingType as MeetingType) ? (input.meetingType as MeetingType) : null;
  const duration = DURATIONS.includes(input.durationMin) ? input.durationMin : null;
  const start = new Date(input.start);
  if (!meetingType || !duration || Number.isNaN(start.getTime())) return { error: t.errors.invalid };
  if (start.getTime() < Date.now() - 5 * 60_000) return { error: t.errors.past };
  const end = new Date(start.getTime() + duration * 60_000);

  const { data: app } = await supabase
    .from('applications')
    .select('id, full_name, email, stage, jobs(title)')
    .eq('id', input.applicationId)
    .eq('company_id', company.id)
    .maybeSingle();
  if (!app) return { error: t.errors.invalid };
  const jobTitle = (app.jobs as { title?: string } | null)?.title ?? '';

  const conns = (await listConnections(company.id)).map((c) => c.provider);
  if (meetingType === 'google_meet' && !conns.includes('google')) return { error: fmt(t.errors.notConnected, { name: 'Google' }) };
  if (meetingType === 'teams' && !conns.includes('microsoft')) return { error: fmt(t.errors.notConnected, { name: 'Microsoft' }) };
  if (meetingType === 'zoom' && !conns.includes('zoom')) return { error: fmt(t.errors.notConnected, { name: 'Zoom' }) };

  const calendar: CalendarProvider | null =
    meetingType === 'google_meet' ? 'google' : meetingType === 'teams' ? 'microsoft' : await connectedCalendar(company.id);

  const customLink = input.customLink?.trim() ? safeUrl(input.customLink.trim()) : null;
  if (meetingType === 'custom' && input.customLink?.trim() && !customLink) return { error: t.errors.link };
  const note = (input.note ?? '').trim().slice(0, 1000);

  const title = fmt(t.eventTitle, { name: app.full_name, job: jobTitle, company: company.name });
  const describe = (link: string | null) =>
    [fmt(t.eventIntro, { company: company.name, job: jobTitle }), note, link ? `${t.joinLabel}: ${link}` : '']
      .filter(Boolean)
      .join('\n\n');

  let zoom: { meetingId: string; joinUrl: string } | null = null;
  let event: { eventId: string; joinUrl: string | null } | null = null;
  try {
    if (meetingType === 'zoom') zoom = await createZoomMeeting(company.id, { topic: title, start, durationMin: duration });
    const link = zoom?.joinUrl ?? customLink;
    if (calendar) {
      event = await createCalendarEvent(company.id, calendar, {
        title,
        description: describe(link),
        start,
        end,
        attendee: { email: app.email, name: app.full_name },
        addVideo: meetingType === 'google_meet' || meetingType === 'teams',
        location: link,
      });
    }
  } catch (err) {
    console.error('Scheduling failed', err);
    if (zoom) await deleteZoomMeeting(company.id, zoom.meetingId).catch(() => {});
    return { error: t.errors.calendar };
  }

  const joinUrl = event?.joinUrl ?? zoom?.joinUrl ?? customLink ?? null;
  const { data: row, error } = await supabase
    .from('interviews')
    .insert({
      company_id: company.id,
      application_id: app.id,
      meeting_type: meetingType,
      calendar: event ? calendar : null,
      starts_at: start.toISOString(),
      duration_min: duration,
      join_url: joinUrl,
      calendar_event_id: event?.eventId ?? null,
      zoom_meeting_id: zoom?.meetingId ?? null,
    })
    .select('id')
    .single();
  if (error || !row) {
    console.error('Interview insert failed', error);
    return { error: t.errors.save };
  }
  if (app.stage === 'applied' || app.stage === 'screening') {
    await supabase.from('applications').update({ stage: 'interview' }).eq('id', app.id).eq('company_id', company.id);
  }
  revalidatePath(`/dashboard/candidates/${app.id}`);
  revalidatePath('/dashboard', 'layout');

  if (event) return { ok: true, invited: true, joinUrl };

  // No calendar connected: hand the recruiter an invite file and a ready email.
  const tz = validTz(input.tz);
  const when = new Intl.DateTimeFormat(locale, { dateStyle: 'full', timeStyle: 'short', timeZone: tz, timeZoneName: 'short' }).format(start);
  const ics = buildIcs({
    uid: row.id,
    title,
    description: describe(joinUrl),
    start,
    end,
    location: joinUrl,
    organizer: { name: company.name, email: user.email },
    attendee: { name: app.full_name, email: app.email },
  });
  const body = [fmt(t.emailGreeting, { name: app.full_name.split(' ')[0] ?? app.full_name }), fmt(t.emailBody, { job: jobTitle, when }), note, joinUrl ? `${t.joinLabel}: ${joinUrl}` : '', fmt(t.emailSign, { company: company.name })]
    .filter(Boolean)
    .join('\n\n');
  const mailto = `mailto:${encodeURIComponent(app.email)}?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
  return { ok: true, invited: false, joinUrl, ics, mailto };
}

export async function cancelInterview(interviewId: string): Promise<{ ok?: boolean; error?: string }> {
  const { supabase, company } = await requireCompany();
  const t = DICTS[getLocale()].dash.schedule;
  const { data } = await supabase.from('interviews').select('*').eq('id', interviewId).eq('company_id', company.id).maybeSingle();
  const iv = data as Interview | null;
  if (!iv) return { error: t.errors.invalid };
  try {
    if (iv.calendar && iv.calendar_event_id) await deleteCalendarEvent(company.id, iv.calendar, iv.calendar_event_id);
    if (iv.zoom_meeting_id) await deleteZoomMeeting(company.id, iv.zoom_meeting_id);
  } catch (err) {
    // Still cancel locally; the event may already be gone or the connection removed.
    console.error('Cancel in provider failed', err);
  }
  const { error } = await createAdminClient()
    .from('interviews')
    .update({ status: 'cancelled' })
    .eq('id', iv.id)
    .eq('company_id', company.id);
  if (error) return { error: t.errors.cancel };
  revalidatePath(`/dashboard/candidates/${iv.application_id}`);
  return { ok: true };
}
