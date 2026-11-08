import 'server-only';
import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, timingSafeEqual } from 'crypto';

/**
 * Encryption for third-party tokens at rest (AES-256-GCM) and signed OAuth state.
 * Key: INTEGRATIONS_SECRET if set, otherwise derived from the service-role key,
 * so no extra setup is needed. Set INTEGRATIONS_SECRET before rotating keys.
 */
function key() {
  const secret = process.env.INTEGRATIONS_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!secret) throw new Error('No secret available for token encryption');
  return createHash('sha256').update(`hirekit:${secret}`).digest();
}

export function encrypt(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key(), iv);
  const data = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  return ['v1', iv.toString('base64url'), cipher.getAuthTag().toString('base64url'), data.toString('base64url')].join('.');
}

export function decrypt(token: string): string {
  const [v, iv, tag, data] = token.split('.');
  if (v !== 'v1' || !iv || !tag || !data) throw new Error('Unreadable token');
  const decipher = createDecipheriv('aes-256-gcm', key(), Buffer.from(iv, 'base64url'));
  decipher.setAuthTag(Buffer.from(tag, 'base64url'));
  return Buffer.concat([decipher.update(Buffer.from(data, 'base64url')), decipher.final()]).toString('utf8');
}

/** payload.signature, valid for `ttlSeconds`. */
export function sign(payload: Record<string, string>, ttlSeconds = 600): string {
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + ttlSeconds })).toString('base64url');
  const sig = createHmac('sha256', key()).update(body).digest('base64url');
  return `${body}.${sig}`;
}

export function verify(token: string | null | undefined): Record<string, string> | null {
  if (!token) return null;
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  const expected = createHmac('sha256', key()).update(body).digest('base64url');
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (typeof data.exp !== 'number' || data.exp < Date.now() / 1000) return null;
    return data;
  } catch {
    return null;
  }
}
