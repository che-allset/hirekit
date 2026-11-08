import 'server-only';

/**
 * Transactional email over Resend's REST API (no SDK).
 *
 * Env:
 *   RESEND_API_KEY   re_… (Resend → API Keys)
 *   EMAIL_FROM       e.g. "HireKit <hello@your-domain.com>" (domain verified in Resend)
 *
 * Without the key nothing is sent and nothing breaks: callers get { skipped: true }.
 */

export const isEmailConfigured = () => !!process.env.RESEND_API_KEY && !!process.env.EMAIL_FROM;

export async function sendEmail(msg: { to: string; subject: string; html: string; text: string; replyTo?: string | null }) {
  if (!isEmailConfigured()) return { skipped: true as const };
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM,
        to: [msg.to],
        subject: msg.subject,
        html: msg.html,
        text: msg.text,
        ...(msg.replyTo ? { reply_to: msg.replyTo } : {}),
      }),
      cache: 'no-store',
    });
    if (!res.ok) {
      console.error('Email failed', res.status, await res.text().catch(() => ''));
      return { ok: false as const };
    }
    return { ok: true as const };
  } catch (err) {
    console.error('Email failed', err);
    return { ok: false as const };
  }
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/**
 * One simple, email-client-safe layout (tables + inline styles).
 * `paragraphs` are plain text; `button` is optional.
 */
export function renderEmail(opts: {
  preheader: string;
  heading: string;
  paragraphs: string[];
  button?: { label: string; url: string };
  footer: string;
  accent?: string;
}) {
  const accent = opts.accent && /^#[0-9a-f]{6}$/i.test(opts.accent) ? opts.accent : '#23272D';
  const html = `<!doctype html><html><body style="margin:0;padding:0;background:#F4F2EE;font-family:Helvetica,Arial,sans-serif;color:#23272D">
<span style="display:none!important;opacity:0;color:transparent;height:0;width:0;overflow:hidden">${esc(opts.preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F4F2EE;padding:32px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:14px;overflow:hidden">
<tr><td style="height:6px;background:${accent}"></td></tr>
<tr><td style="padding:32px 32px 8px">
<h1 style="margin:0 0 16px;font-size:24px;line-height:1.25;font-weight:700">${esc(opts.heading)}</h1>
${opts.paragraphs.map((p) => `<p style="margin:0 0 14px;font-size:16px;line-height:1.55;color:#3D424A">${esc(p).replace(/\n/g, '<br>')}</p>`).join('')}
${
  opts.button
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:22px 0 8px"><tr><td style="background:#FFD12E;border-radius:10px"><a href="${esc(opts.button.url)}" style="display:inline-block;padding:13px 22px;font-size:15px;font-weight:700;color:#23272D;text-decoration:none">${esc(opts.button.label)}</a></td></tr></table>`
    : ''
}
</td></tr>
<tr><td style="padding:16px 32px 28px;font-size:12px;line-height:1.5;color:#8A8F98">${esc(opts.footer)}</td></tr>
</table></td></tr></table></body></html>`;
  const text = [opts.heading, '', ...opts.paragraphs, ...(opts.button ? ['', `${opts.button.label}: ${opts.button.url}`] : []), '', opts.footer].join('\n');
  return { html, text };
}
