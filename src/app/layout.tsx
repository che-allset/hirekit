import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { getDict } from '@/i18n/server';
import { getOrigin } from '@/lib/company';
import { ErrorTextProvider } from '@/components/ErrorView';

// Body: TeX Gyre Heros (GUST Font License). Titles: Inter Display SemiBold (SIL OFL).
const sans = localFont({
  src: [
    { path: '../fonts/texgyreheros-regular.otf', weight: '400', style: 'normal' },
    { path: '../fonts/texgyreheros-bold.otf', weight: '700', style: 'normal' },
  ],
  variable: '--font-sans',
  display: 'swap',
});

const display = localFont({
  src: [{ path: '../fonts/InterDisplay-SemiBold.otf', weight: '600', style: 'normal' }],
  variable: '--font-display',
  display: 'swap',
});

const OG_LOCALE = { en: 'en_GB', de: 'de_DE', es: 'es_ES', fr: 'fr_FR' } as const;

/** Title, description and link preview (LinkedIn, Slack, WhatsApp…) in the visitor's language. */
export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = getDict();
  // The tour poster (1280×720) is the preview image; it exists in all four languages.
  const image = { url: `/video/tour-poster-${locale}.jpg`, width: 1280, height: 720, alt: t.meta.title };
  return {
    metadataBase: new URL(getOrigin()),
    title: { default: t.meta.title, template: '%s · HireKit' },
    description: t.meta.description,
    openGraph: {
      type: 'website',
      siteName: 'HireKit',
      title: t.meta.title,
      description: t.meta.description,
      locale: OG_LOCALE[locale],
      images: [image],
    },
    twitter: { card: 'summary_large_image', title: t.meta.title, description: t.meta.description, images: [image.url] },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { locale, t } = getDict();
  return (
    <html lang={locale} className={`${sans.variable} ${display.variable}`}>
      <body className="min-h-screen font-sans">
        <ErrorTextProvider text={t.errorPage}>{children}</ErrorTextProvider>
      </body>
    </html>
  );
}
