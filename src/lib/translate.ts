import 'server-only';
import { unstable_cache } from 'next/cache';
import { translateStrings } from './ai';
import type { Company, Job } from './types';
import { AI_LANGUAGE, type Locale } from '@/i18n';

/**
 * Companies write job posts in their own language; visitors read them in theirs.
 * Each unique set of strings is translated once per language and cached for 30 days.
 * Any failure falls back to the original text, so a careers page never breaks.
 */
const cachedTranslate = unstable_cache(
  async (locale: Locale, strings: string[]) => translateStrings(strings, AI_LANGUAGE[locale]),
  ['hirekit-translate-v1'],
  { revalidate: 60 * 60 * 24 * 30 },
);

async function translateMap(locale: Locale, input: (string | null | undefined)[]): Promise<Map<string, string>> {
  const unique = Array.from(new Set(input.filter((s): s is string => !!s && s.trim().length > 0)));
  const map = new Map<string, string>();
  if (unique.length === 0 || !process.env.ANTHROPIC_API_KEY) return map;
  try {
    const out = await cachedTranslate(locale, unique);
    unique.forEach((s, i) => map.set(s, out[i] || s));
  } catch (err) {
    console.error('Job translation failed, showing original text', err);
  }
  return map;
}

const pick = (map: Map<string, string>, s: string | null) => (s ? map.get(s) ?? s : s);

/** Careers list: company tagline plus each job's title, department and location. */
export async function translateCareers(company: Company, jobs: Job[], locale: Locale) {
  const map = await translateMap(locale, [company.tagline, ...jobs.flatMap((j) => [j.title, j.department, j.location, j.salary_range])]);
  return {
    company: { ...company, tagline: pick(map, company.tagline) },
    jobs: jobs.map((j) => ({
      ...j,
      title: pick(map, j.title) as string,
      department: pick(map, j.department),
      location: pick(map, j.location),
      salary_range: pick(map, j.salary_range),
    })),
  };
}

/** Job page: every field the candidate reads. */
export async function translateJob(job: Job, locale: Locale): Promise<Job> {
  const map = await translateMap(locale, [job.title, job.department, job.location, job.salary_range, job.description, job.requirements]);
  return {
    ...job,
    title: pick(map, job.title) as string,
    department: pick(map, job.department),
    location: pick(map, job.location),
    salary_range: pick(map, job.salary_range),
    description: pick(map, job.description) as string,
    requirements: pick(map, job.requirements) as string,
  };
}
