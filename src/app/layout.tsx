import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { getDict } from '@/i18n/server';
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

export const metadata: Metadata = {
  title: 'HireKit: hire like you have an HR team',
  description:
    'A careers page, a jobs widget for the website you already have, and an assistant that reads every application against your requirements.',
};

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
