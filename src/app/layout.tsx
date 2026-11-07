import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';

// Self-hosted grotesque (TeX Gyre Heros, GUST Font License). One family:
// the condensed bold cut for display, regular/bold for everything else.
const sans = localFont({
  src: [
    { path: '../fonts/texgyreheros-regular.otf', weight: '400', style: 'normal' },
    { path: '../fonts/texgyreheros-bold.otf', weight: '700', style: 'normal' },
  ],
  variable: '--font-sans',
  display: 'swap',
});

const display = localFont({
  src: [{ path: '../fonts/texgyreheroscn-bold.otf', weight: '700', style: 'normal' }],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'HireKit · Hiring for teams without an HR department',
  description:
    'A careers page, a jobs widget for the website you already have, and an assistant that reads every application against your requirements.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`}>
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  );
}
