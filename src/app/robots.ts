import type { MetadataRoute } from 'next';
import { getOrigin } from '@/lib/company';

export const dynamic = 'force-dynamic';

/** Index the landing and careers pages; keep the app and the APIs out of search. */
export default function robots(): MetadataRoute.Robots {
  const origin = getOrigin();
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // /embed/ stays crawlable on purpose: its pages say "noindex", and Google has to read them to see that.
        disallow: ['/dashboard', '/api/', '/auth/', '/reset-password'],
      },
    ],
    sitemap: `${origin}/sitemap.xml`,
  };
}
