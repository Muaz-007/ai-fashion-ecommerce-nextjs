import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Toast } from '@/components/Toast';
import { Hero } from '@/components/Hero';
import { SectionHeader } from '@/components/SectionHeader';
import { ProductCard } from '@/components/ProductCard';
import { CollectionCard } from '@/components/CollectionCard';
import { Features } from '@/components/Features';
import { StorySection } from '@/components/StorySection';
import { AISection } from '@/components/AISection';
import { prisma } from '@/lib/prisma';
import { getPersonalizedRecommendations } from '@/lib/recommendations';

// Revalidate every 60s instead of rebuilding on every request.
// Guest homepage data rarely changes — caching is safe.
export const revalidate = 60;

export default async function HomePage() {
  // Fetch everything in parallel — saves serial RTT latency
  const [newBadgeProducts, { recommendations }] = await Promise.all([
    prisma.product.findMany({
      where: {
        isActive: true,
        badges: { some: { badgeType: 'new' } },
      },
      include: { category: true, badges: true },
      take: 4,
      orderBy: { createdAt: 'desc' },
    }),
    getPersonalizedRecommendations(null, null, 4),
  ]);

  let newArrivals = newBadgeProducts;
  if (newArrivals.length < 4) {
    const filler = await prisma.product.findMany({
      where: { isActive: true, id: { notIn: newArrivals.map((p) => p.id) } },
      include: { category: true, badges: true },
      take: 4 - newArrivals.length,
      orderBy: { createdAt: 'desc' },
    });
    newArrivals = [...newArrivals, ...filler];
  }

  return (
    <>
      <Header />
      <Toast />
      <main id="main-content">
        <Hero />

        {/* Collections */}
        <section className="section bg-cream-200">
          <div className="container-padded">
            <SectionHeader
              eyebrow="Curated Edits"
              title={
                <>
                  Three Worlds, <em className="text-accent italic font-normal">One Heritage</em>
                </>
              }
              subtitle="Each collection tells a story — from everyday pret to bridal couture."
            />
            <div className="grid md:grid-cols-3 gap-6">
              <CollectionCard
                href="/shop?category=Pret"
                eyebrow="Everyday Luxe"
                title="The Pret Edit"
                description="Ready-to-wear sophistication for the modern muse."
                gradient="linear-gradient(135deg, #C9B398 0%, #8B6F47 100%)"
                variant="silhouette"
                index={0}
              />
              <CollectionCard
                href="/shop?category=Formal"
                eyebrow="Evening Affairs"
                title="Formal Couture"
                description="Embellished pieces for moments worth remembering."
                gradient="linear-gradient(135deg, #5A1A2F 0%, #2C0D17 100%)"
                variant="paisley"
                index={1}
              />
              <CollectionCard
                href="/shop?category=Bridal"
                eyebrow="Wedding Atelier"
                title="Bridal Heirlooms"
                description="Hand-crafted masterpieces for your most cherished day."
                gradient="linear-gradient(135deg, #B08D5A 0%, #6B4F2E 100%)"
                variant="damask"
                index={2}
              />
            </div>
          </div>
        </section>

        {/* New Arrivals */}
        <section className="section">
          <div className="container-padded">
            <SectionHeader
              eyebrow="Just Arrived"
              title={<>The <em className="text-accent italic font-normal">New Arrivals</em></>}
              subtitle="Our latest pieces, freshly arrived in the atelier."
            />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {newArrivals.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
            <div className="text-center mt-12">
              <Link href="/shop" className="btn btn-secondary">
                View All Products
              </Link>
            </div>
          </div>
        </section>

        {/* AI Recommendations */}
        <AISection recommendations={recommendations} />

        {/* Brand Story */}
        <StorySection />

        {/* Features */}
        <Features />

        {/* Newsletter banner */}
        <section className="section bg-ink text-cream">
          <div className="container-padded text-center max-w-2xl mx-auto">
            <div className="eyebrow mb-4">Join the Aurelle Atelier</div>
            <h2 className="text-display-lg mb-6 text-cream">
              First Access. <em className="text-accent italic font-normal">Always.</em>
            </h2>
            <p className="text-cream/70 mb-8 leading-relaxed">
              Subscribe for early collections, private events, and AI-curated style guides delivered to your inbox.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
