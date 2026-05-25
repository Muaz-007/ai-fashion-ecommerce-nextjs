import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ?? 'http://localhost:3000';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE_URL}/shop`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/size-guide`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/cookies`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];

  // Dynamic: every active product + every category
  let dynamicRoutes: MetadataRoute.Sitemap = [];
  try {
    const [products, categories] = await Promise.all([
      prisma.product.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true },
      }),
      prisma.category.findMany({
        where: { isActive: true },
        select: { name: true },
      }),
    ]);

    dynamicRoutes = [
      ...products.map((p) => ({
        url: `${BASE_URL}/shop/${p.slug}`,
        lastModified: p.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      })),
      ...categories.map((c) => ({
        url: `${BASE_URL}/shop?category=${encodeURIComponent(c.name)}`,
        lastModified: now,
        changeFrequency: 'daily' as const,
        priority: 0.7,
      })),
    ];
  } catch {
    // If DB is unreachable at build time, ship static routes only
  }

  return [...staticRoutes, ...dynamicRoutes];
}
