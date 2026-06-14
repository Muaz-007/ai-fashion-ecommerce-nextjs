import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Toast } from '@/components/Toast';
import { ShopClient } from './ShopClient';
import { prisma } from '@/lib/prisma';

// Render on request — DB is needed at runtime, not build time.
export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ category?: string; search?: string }>;
}

export default async function ShopPage({ searchParams }: PageProps) {
  const sp = await searchParams;

  // Parallelize the two queries
  const [categories, products] = await Promise.all([
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { products: { where: { isActive: true } } } } },
    }),
    prisma.product.findMany({
      where: {
        isActive: true,
        ...(sp.category && sp.category !== 'All'
          ? { category: { name: sp.category } }
          : {}),
        ...(sp.search
          ? {
              OR: [
                { name: { contains: sp.search } },
                { description: { contains: sp.search } },
                { tags: { some: { tag: { contains: sp.search } } } },
              ],
            }
          : {}),
      },
      include: {
        category: true,
        sizes: true,
        colors: true,
        badges: true,
        tags: true,
      },
      orderBy: [{ isFeatured: 'desc' }, { rating: 'desc' }],
    }),
  ]);

  return (
    <>
      <Header />
      <Toast />
      <main id="main-content">
        <ShopClient
          initialProducts={products}
          categories={categories}
          activeCategory={sp.category || 'All'}
          searchQuery={sp.search}
        />
      </main>
      <Footer />
    </>
  );
}
