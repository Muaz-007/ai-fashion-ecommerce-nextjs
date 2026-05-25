import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Toast } from '@/components/Toast';
import { ProductDetailClient } from './ProductDetailClient';
import { ProductCard } from '@/components/ProductCard';
import { SectionHeader } from '@/components/SectionHeader';
import { prisma } from '@/lib/prisma';
import { getSimilarProducts, getFrequentlyBoughtTogether } from '@/lib/recommendations';

// Product detail rarely changes — 5 min ISR is plenty
export const revalidate = 300;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      sizes: true,
      colors: true,
      badges: true,
      tags: true,
    },
  });

  if (!product || !product.isActive) {
    notFound();
  }

  // Fire-and-forget view increment (doesn't block render)
  prisma.product
    .update({ where: { id: product.id }, data: { viewCount: { increment: 1 } } })
    .catch(() => {});

  // Recommendations run in parallel — independent of each other
  const [similar, frequentlyBought] = await Promise.all([
    getSimilarProducts(product.id, 4),
    getFrequentlyBoughtTogether(product.id, 4),
  ]);

  return (
    <>
      <Header />
      <Toast />
      <main id="main-content">
        <section className="pt-44 md:pt-52 pb-24">
          <div className="container-padded">
            <nav className="flex gap-3 text-sm text-muted uppercase tracking-wider mb-8">
              <Link href="/" className="hover:text-accent">Home</Link>
              <span>/</span>
              <Link href="/shop" className="hover:text-accent">Shop</Link>
              <span>/</span>
              <span>{product.name}</span>
            </nav>

            <ProductDetailClient product={product} />
          </div>
        </section>

        {/* Related products */}
        <section className="section bg-cream-200">
          <div className="container-padded">
            <SectionHeader
              eyebrow="You May Also Love"
              title={
                <>
                  Curated <em className="text-accent italic font-normal">For You</em>
                </>
              }
            />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {similar.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        </section>

        {/* AI Frequently Bought */}
        <section className="section bg-ink text-cream">
          <div className="container-padded">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent text-accent text-xs uppercase tracking-widest rounded-full mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-soft" />
                AI Picks Based on This Item
              </div>
              <h2 className="text-display-lg text-cream">
                Complete the <em className="text-accent italic font-normal">Look</em>
              </h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {frequentlyBought.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} theme="dark" />
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
