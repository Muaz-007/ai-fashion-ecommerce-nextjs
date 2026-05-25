import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Maison Aurelle — Luxury Fashion',
    short_name: 'Aurelle',
    description:
      'An AI-integrated fashion atelier offering personalized luxury experiences.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f5f1e8',
    theme_color: '#1a1714',
    orientation: 'portrait-primary',
    categories: ['shopping', 'lifestyle', 'fashion'],
    icons: [
      {
        src: '/icon',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  };
}
