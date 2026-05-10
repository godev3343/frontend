import './globals.css';
import { Providers } from './providers';
import type { Metadata, Viewport } from 'next';
import { Manrope } from 'next/font/google';

const manrope = Manrope({ subsets: ['latin', 'cyrillic'], variable: '--font-sans', display: 'swap' });

export const metadata: Metadata = {
  title: 'Go — оживи свой город',
  description: 'Социальная карта города с вайбом, событиями и AI-рекомендациями',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Go',
  },
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#0A0A0A',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
<html lang="ru" className={`dark ${manrope.variable}`} suppressHydrationWarning>
      <body className="bg-background text-foreground min-h-screen antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
