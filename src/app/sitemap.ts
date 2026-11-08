import type { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';
import { getOrigin } from '@/lib/company';

export const dynamic = 'force-dynamic';

/**
 * Landing page, sign-up, and the careers page of every company with open roles.
 * Public data only (the RLS-scoped client sees open jobs and company slugs, nothing else).
 * Single job pages are reached from the careers pages, so they aren't listed here.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = getOrigin();
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [
    { url: `${origin}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${origin}/signup`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
  ];

  try {
    const { data } = await createClient().from('jobs').select('created_at, companies(slug)').eq('status', 'open').limit(5000);
    const latest = new Map<string, string>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const row of (data ?? []) as any[]) {
      const slug = row.companies?.slug as string | undefined;
      if (!slug) continue;
      const prev = latest.get(slug);
      if (!prev || row.created_at > prev) latest.set(slug, row.created_at);
    }
    for (const [slug, updated] of latest) {
      entries.push({ url: `${origin}/careers/${slug}`, lastModified: new Date(updated), changeFrequency: 'daily', priority: 0.8 });
    }
  } catch (err) {
    console.error('Sitemap: could not list careers pages', err);
  }
  return entries;
}
