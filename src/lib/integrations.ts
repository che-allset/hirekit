import 'server-only';
import { createAdminClient } from './supabase/admin';
import { decrypt, encrypt } from './crypto';
import type { IntegrationProvider } from './types';

/**
 * Calendar and video-call integrations over plain OAuth 2.0 + REST.
 *
 *   google     Google Calendar + Google Meet   GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET
 *   microsoft  Outlook calendar + Teams        MICROSOFT_CLIENT_ID / MICROSOFT_CLIENT_SECRET
 *   zoom       Zoom meetings                   ZOOM_CLIENT_ID / ZOOM_CLIENT_SECRET
 *
 * Redirect URI to register with each provider:
 *   https://YOUR-DOMAIN/api/integrations/{google|microsoft|zoom}/callback
 */

interface ProviderConfig {
  env: [string, string];
  authorizeUrl: string;
  tokenUrl: string;
  scopes: string;
  extraAuth: Record<string, string>;
  basicAuth: boolean;
  email: (accessToken: string) => Promise<string | null>;
}

const getJson = async (url: string, token: string) => {
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
  return res.ok ? res.json() : null;
};

const PROVIDERS: Record<IntegrationProvider, ProviderConfig> = {
  google: {
    env: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'],
    authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    scopes:
      'openid email https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.freebusy',
    extraAuth: { access_type: 'offline', prompt: 'consent', include_granted_scopes: 'true' },
    basicAuth: false,
    email: async (t) => (await getJson('https://openidconnect.googleapis.com/v1/userinfo', t))?.email ?? null,
  },
  microsoft: {
    env: ['MICROSOFT_CLIENT_ID', 'MICROSOFT_CLIENT_SECRET'],
    authorizeUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    scopes: 'openid email offline_access User.Read Calendars.ReadWrite',
    extraAuth: { prompt: 'select_account', response_mode: 'query' },
    basicAuth: false,
    email: async (t) => {
      const me = await getJson('https://graph.microsoft.com/v1.0/me?$select=mail,userPrincipalName', t);
      return me?.mail ?? me?.userPrincipalName ?? null;
    },
  },
  zoom: {
    env: ['ZOOM_CLIENT_ID', 'ZOOM_CLIENT_SECRET'],
    authorizeUrl: 'https://zoom.us/oauth/authorize',
    tokenUrl: 'https://zoom.us/oauth/token',
    scopes: '', // configured on the Zoom app (meeting:write, user:read)
    extraAuth: {},
    basicAuth: true,
    email: async (t) => (await getJson('https://api.zoom.us/v2/users/me', t))?.email ?? null,
  },
};

export const ALL_PROVIDERS: IntegrationProvider[] = ['google', 'microsoft', 'zoom'];

export const isProvider = (v: unknown): v is IntegrationProvider =>
  typeof v === 'string' && (ALL_PROVIDERS as string[]).includes(v);

export function isConfigured(p: IntegrationProvider) {
  const [id, secret] = PROVIDERS[p].env;
  return !!process.env[id] && !!process.env[secret];
}

const creds = (p: IntegrationProvider) => {
  const [id, secret] = PROVIDERS[p].env;
  return { id: process.env[id]!, secret: process.env[secret]! };
};

export function authorizeUrl(p: IntegrationProvider, redirectUri: string, state: string) {
  const cfg = PROVIDERS[p];
  const params = new URLSearchParams({
    client_id: creds(p).id,
    redirect_uri: redirectUri,
    response_type: 'code',
    state,
    ...(cfg.scopes ? { scope: cfg.scopes } : {}),
    ...cfg.extraAuth,
  });
  return `${cfg.authorizeUrl}?${params}`;
}

interface Tokens {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
}

async function tokenRequest(p: IntegrationProvider, body: Record<string, string>): Promise<Tokens> {
  const cfg = PROVIDERS[p];
  const { id, secret } = creds(p);
  const headers: Record<string, string> = { 'Content-Type': 'application/x-www-form-urlencoded' };
  const form = new URLSearchParams(body);
  if (cfg.basicAuth) headers.Authorization = `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`;
  else {
    form.set('client_id', id);
    form.set('client_secret', secret);
  }
  const res = await fetch(cfg.tokenUrl, { method: 'POST', headers, body: form, cache: 'no-store' });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.access_token) throw new Error(`${p} token error: ${json.error_description || json.error || res.status}`);
  return json as Tokens;
}

/** Callback step: code → tokens → stored (encrypted) for the company. */
export async function connect(companyId: string, p: IntegrationProvider, code: string, redirectUri: string) {
  const tokens = await tokenRequest(p, { grant_type: 'authorization_code', code, redirect_uri: redirectUri });
  const email = await PROVIDERS[p].email(tokens.access_token).catch(() => null);
  const { error } = await createAdminClient()
    .from('integrations')
    .upsert(
      {
        company_id: companyId,
        provider: p,
        account_email: email,
        access_token: encrypt(tokens.access_token),
        refresh_token: tokens.refresh_token ? encrypt(tokens.refresh_token) : null,
        expires_at: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000).toISOString() : null,
      },
      { onConflict: 'company_id,provider' },
    );
  if (error) throw new Error(error.message);
  return email;
}

export async function listConnections(companyId: string) {
  const { data } = await createAdminClient()
    .from('integrations')
    .select('provider, account_email, created_at')
    .eq('company_id', companyId);
  return (data ?? []) as { provider: IntegrationProvider; account_email: string | null; created_at: string }[];
}

export async function disconnect(companyId: string, p: IntegrationProvider) {
  await createAdminClient().from('integrations').delete().eq('company_id', companyId).eq('provider', p);
}

/** A valid access token for the company's connection, refreshing it when needed. */
async function accessToken(companyId: string, p: IntegrationProvider): Promise<string> {
  const admin = createAdminClient();
  const { data } = await admin.from('integrations').select('*').eq('company_id', companyId).eq('provider', p).maybeSingle();
  if (!data) throw new Error(`${p} is not connected`);
  const fresh = !data.expires_at || new Date(data.expires_at).getTime() > Date.now() + 60_000;
  if (fresh) return decrypt(data.access_token);
  if (!data.refresh_token) throw new Error(`${p} session expired, reconnect it`);
  const tokens = await tokenRequest(p, { grant_type: 'refresh_token', refresh_token: decrypt(data.refresh_token) });
  await admin
    .from('integrations')
    .update({
      access_token: encrypt(tokens.access_token),
      ...(tokens.refresh_token ? { refresh_token: encrypt(tokens.refresh_token) } : {}),
      expires_at: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000).toISOString() : null,
    })
    .eq('id', data.id);
  return tokens.access_token;
}

async function api(companyId: string, p: IntegrationProvider, url: string, init: RequestInit = {}) {
  const token = await accessToken(companyId, p);
  const res = await fetch(url, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...(init.headers ?? {}) },
    cache: 'no-store',
  });
  if (res.status === 204) return null;
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(`${p} API ${res.status}: ${json?.error?.message || json?.message || 'request failed'}`);
  return json;
}

// ───────────────────────── Calendars ─────────────────────────

export type CalendarProvider = 'google' | 'microsoft';
export interface Busy {
  start: string;
  end: string;
}

/** Busy blocks in the connected calendar between two instants (ISO). */
export async function busyTimes(companyId: string, cal: CalendarProvider, from: string, to: string): Promise<Busy[]> {
  if (cal === 'google') {
    const json = await api(companyId, 'google', 'https://www.googleapis.com/calendar/v3/freeBusy', {
      method: 'POST',
      body: JSON.stringify({ timeMin: from, timeMax: to, items: [{ id: 'primary' }] }),
    });
    return (json?.calendars?.primary?.busy ?? []) as Busy[];
  }
  const params = new URLSearchParams({
    startDateTime: from,
    endDateTime: to,
    $select: 'start,end,showAs,isCancelled',
    $top: '250',
  });
  const json = await api(companyId, 'microsoft', `https://graph.microsoft.com/v1.0/me/calendarView?${params}`, {
    headers: { Prefer: 'outlook.timezone="UTC"' },
  });
  return ((json?.value ?? []) as any[])
    .filter((e) => !e.isCancelled && e.showAs !== 'free')
    .map((e) => ({ start: `${String(e.start.dateTime).slice(0, 19)}Z`, end: `${String(e.end.dateTime).slice(0, 19)}Z` }));
}

export interface EventInput {
  title: string;
  description: string;
  start: Date;
  end: Date;
  attendee: { email: string; name: string };
  /** Ask the calendar to add its own video link (Meet for Google, Teams for Outlook). */
  addVideo: boolean;
  /** An existing link to put on the invite (e.g. Zoom or a custom link). */
  location?: string | null;
}

/** Creates the event; the calendar provider emails the invite to the candidate. */
export async function createCalendarEvent(companyId: string, cal: CalendarProvider, e: EventInput) {
  if (cal === 'google') {
    const body: Record<string, unknown> = {
      summary: e.title,
      description: e.description,
      start: { dateTime: e.start.toISOString() },
      end: { dateTime: e.end.toISOString() },
      attendees: [{ email: e.attendee.email, displayName: e.attendee.name }],
      ...(e.location ? { location: e.location } : {}),
      ...(e.addVideo
        ? { conferenceData: { createRequest: { requestId: crypto.randomUUID(), conferenceSolutionKey: { type: 'hangoutsMeet' } } } }
        : {}),
    };
    const json = await api(
      companyId,
      'google',
      'https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1&sendUpdates=all',
      { method: 'POST', body: JSON.stringify(body) },
    );
    const meet = json?.hangoutLink ?? json?.conferenceData?.entryPoints?.find((p: any) => p.entryPointType === 'video')?.uri;
    return { eventId: json.id as string, joinUrl: (meet as string | undefined) ?? e.location ?? null };
  }

  const utc = (d: Date) => d.toISOString().replace('Z', '');
  const body: Record<string, unknown> = {
    subject: e.title,
    body: { contentType: 'text', content: e.description },
    start: { dateTime: utc(e.start), timeZone: 'UTC' },
    end: { dateTime: utc(e.end), timeZone: 'UTC' },
    attendees: [{ emailAddress: { address: e.attendee.email, name: e.attendee.name }, type: 'required' }],
    ...(e.location ? { location: { displayName: e.location } } : {}),
    ...(e.addVideo ? { isOnlineMeeting: true, onlineMeetingProvider: 'teamsForBusiness' } : {}),
  };
  let json: any;
  try {
    json = await api(companyId, 'microsoft', 'https://graph.microsoft.com/v1.0/me/events', { method: 'POST', body: JSON.stringify(body) });
  } catch (err) {
    // Personal Outlook accounts can't host Teams for Business meetings: book without it.
    if (!e.addVideo) throw err;
    delete body.isOnlineMeeting;
    delete body.onlineMeetingProvider;
    json = await api(companyId, 'microsoft', 'https://graph.microsoft.com/v1.0/me/events', { method: 'POST', body: JSON.stringify(body) });
  }
  return { eventId: json.id as string, joinUrl: (json?.onlineMeeting?.joinUrl as string | undefined) ?? e.location ?? null };
}

export async function deleteCalendarEvent(companyId: string, cal: CalendarProvider, eventId: string) {
  if (cal === 'google') {
    await api(
      companyId,
      'google',
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(eventId)}?sendUpdates=all`,
      { method: 'DELETE' },
    );
  } else {
    // Cancelling (rather than deleting) sends the attendee a cancellation notice.
    await api(companyId, 'microsoft', `https://graph.microsoft.com/v1.0/me/events/${encodeURIComponent(eventId)}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ comment: '' }),
    });
  }
}

// ───────────────────────── Zoom ─────────────────────────

export async function createZoomMeeting(companyId: string, m: { topic: string; start: Date; durationMin: number }) {
  const json = await api(companyId, 'zoom', 'https://api.zoom.us/v2/users/me/meetings', {
    method: 'POST',
    body: JSON.stringify({
      topic: m.topic.slice(0, 200),
      type: 2,
      start_time: m.start.toISOString().replace(/\.\d{3}Z$/, 'Z'),
      duration: m.durationMin,
      timezone: 'UTC',
      settings: { waiting_room: true, join_before_host: false },
    }),
  });
  return { meetingId: String(json.id), joinUrl: json.join_url as string };
}

export async function deleteZoomMeeting(companyId: string, meetingId: string) {
  await api(companyId, 'zoom', `https://api.zoom.us/v2/meetings/${encodeURIComponent(meetingId)}`, { method: 'DELETE' });
}
