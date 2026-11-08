import type { Metadata } from 'next';

/**
 * Widget pages live inside an iframe on the company's own website.
 * Keep them out of search results: the careers pages are the ones to index.
 */
export const metadata: Metadata = { robots: { index: false, follow: true } };

export default function EmbedLayout({ children }: { children: React.ReactNode }) {
  return children;
}
