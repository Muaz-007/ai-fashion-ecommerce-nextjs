import type { Metadata } from 'next';
import { Cormorant_Garamond, Inter, Italianno } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import './globals.css';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-body',
  display: 'swap',
});

const italianno = Italianno({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-script',
  display: 'swap',
});

const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Maison Aurelle — Luxury Fashion, Intelligently Curated',
    template: '%s — Maison Aurelle',
  },
  description:
    'An AI-integrated fashion atelier offering personalized luxury experiences. Discover timeless silhouettes and contemporary elegance.',
  keywords: ['fashion', 'luxury', 'pakistan', 'bridal', 'pret', 'AI', 'e-commerce'],
  authors: [{ name: 'Maison Aurelle' }],
  openGraph: {
    title: 'Maison Aurelle — Luxury Fashion, Intelligently Curated',
    description: 'AI-integrated fashion atelier offering personalized luxury experiences.',
    type: 'website',
    locale: 'en_PK',
    siteName: 'Maison Aurelle',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Maison Aurelle — Luxury Fashion, Intelligently Curated',
    description: 'An AI-integrated fashion atelier offering personalized luxury experiences.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${inter.variable} ${italianno.variable}`}
    >
      <body>
        {/* Skip-to-content link — only visible on keyboard focus */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:bg-ink focus:text-cream focus:px-4 focus:py-2 focus:rounded focus:shadow-large"
        >
          Skip to content
        </a>

        {children}

        {/* Global confirm dialog — replaces native window.confirm() */}
        <ConfirmDialog />

        {/* Vercel observability — auto-enabled when deployed on Vercel */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
