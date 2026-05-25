import type { Metadata } from 'next';
import { Cormorant_Garamond, Inter, Italianno } from 'next/font/google';
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

export const metadata: Metadata = {
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
    description: 'AI-integrated fashion atelier',
    type: 'website',
    locale: 'en_PK',
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
        {children}
        {/* Global confirm dialog — replaces native window.confirm() */}
        <ConfirmDialog />
      </body>
    </html>
  );
}
