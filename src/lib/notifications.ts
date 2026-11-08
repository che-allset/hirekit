import 'server-only';
import { createAdminClient } from './supabase/admin';
import { renderEmail, sendEmail, isEmailConfigured } from './email';
import { DEMO_SLUG } from './demo';
import type { Company, Verdict } from './types';
import { DICTS, fmt, isLocale, type Locale } from '@/i18n';

/**
 * Emails after a new application:
 *  - the candidate gets a confirmation in the language they applied in;
 *  - the company owner gets an alert (with the AI score) in their dashboard language.
 * Never throws: a failed email must not fail the application.
 */
export async function sendApplicationEmails(input: {
  company: Company;
  jobTitle: string;
  application: { id: string; full_name: string; email: string };
  candidateLang: Locale;
  screening: { score: number; verdict: Verdict } | null;
  origin: string;
}) {
  if (!isEmailConfigured()) return;
  const { company, jobTitle, application, screening, origin } = input;
  const firstName = application.full_name.split(' ')[0] || application.full_name;

  // 1. Candidate confirmation
  try {
    const t = DICTS[input.candidateLang].emails;
    const { html, text } = renderEmail({
      preheader: fmt(t.applied.subject, { job: jobTitle, company: company.name }),
      heading: fmt(t.applied.heading, { name: firstName }),
      paragraphs: [fmt(t.applied.body1, { job: jobTitle, company: company.name }), t.applied.body2],
      footer: fmt(t.footer, { company: company.name }),
      accent: company.brand_color,
    });
    await sendEmail({ to: application.email, subject: fmt(t.applied.subject, { job: jobTitle, company: company.name }), html, text });
  } catch (err) {
    console.error('Candidate email failed', err);
  }

  // 2. Recruiter alert (not for the shared demo workspace)
  if (company.slug === DEMO_SLUG) return;
  try {
    const { data } = await createAdminClient().auth.admin.getUserById(company.owner_id);
    const to = data?.user?.email;
    if (!to) return;
    const lang: Locale = isLocale(company.locale) ? company.locale : 'en';
    const t = DICTS[lang].emails.newApplicant;
    const verdicts = DICTS[lang].dash.verdicts;
    const subject = fmt(t.subject, { name: application.full_name, job: jobTitle });
    const { html, text } = renderEmail({
      preheader: subject,
      heading: fmt(t.heading, { job: jobTitle }),
      paragraphs: [
        fmt(t.body, { name: application.full_name }),
        screening ? fmt(t.scored, { score: screening.score, verdict: verdicts[screening.verdict] }) : t.notScored,
      ],
      button: { label: t.button, url: `${origin}/dashboard/candidates/${application.id}` },
      footer: fmt(t.footer, { company: company.name }),
    });
    await sendEmail({ to, subject, html, text, replyTo: application.email });
  } catch (err) {
    console.error('Recruiter email failed', err);
  }
}
