// src/app/layout.tsx
import './globals.css';
import "maplibre-gl/dist/maplibre-gl.css";

import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';

import { Providers } from './providers';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Go — оживи свой город',
    template: '%s · Go',
  },
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
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    title: 'Go — оживи свой город',
    description: 'Социальная карта города с вайбом, событиями и AI-рекомендациями',
    siteName: 'Go',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Go — оживи свой город',
    description: 'Социальная карта города с вайбом, событиями и AI-рекомендациями',
  },
};

export const viewport: Viewport = {
  themeColor: '#111827',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`dark ${inter.variable}`} suppressHydrationWarning>
      <body className="bg-background text-foreground min-h-dvh antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
