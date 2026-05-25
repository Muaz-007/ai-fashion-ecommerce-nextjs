import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Toast } from '@/components/Toast';
import { StorySection } from '@/components/StorySection';
import { Features } from '@/components/Features';
import { SectionHeader } from '@/components/SectionHeader';
import { ProductPlaceholder } from '@/components/ProductPlaceholder';
import Link from 'next/link';

export const metadata = { title: 'Our Atelier' };

// Fully static — content never changes
export const dynamic = 'force-static';

const TEAM = [
  { name: 'Saqib Ali', role: 'Founder & CEO', gradient: 'linear-gradient(160deg, #C9B398 0%, #8B6F47 100%)' },
  { name: 'Ayesha Tariq', role: 'Creative Director', gradient: 'linear-gradient(160deg, #5A1A2F 0%, #2C0D17 100%)' },
  { name: 'Hassan Raza', role: 'Head of AI', gradient: 'linear-gradient(160deg, #1A2F3A 0%, #0D1820 100%)' },
  { name: 'Mehreen Sheikh', role: 'Master Artisan', gradient: 'linear-gradient(160deg, #B08D5A 0%, #6B4F2E 100%)' },
];

export default function AboutPage() {
  return (
    <>
      <Header />
      <Toast />
      <main>
        <section className="pt-44 md:pt-52 pb-20 text-center bg-gradient-to-b from-cream-200 to-cream">
          <div className="container-padded">
            <div className="eyebrow mb-4">Est. 2026 · Lahore, Pakistan</div>
            <h1 className="text-display-xl mb-6 max-w-4xl mx-auto text-balance">
              Heritage Crafted, <em className="text-accent italic font-normal">Intelligence Curated</em>
            </h1>
            <p className="max-w-2xl mx-auto text-muted text-lg leading-relaxed">
              We are an atelier where ancient artisanal wisdom converses with modern intelligence — creating fashion that is at once timeless and uniquely yours.
            </p>
          </div>
        </section>

        <StorySection />
        <Features />

        {/* Team */}
        <section className="section">
          <div className="container-padded">
            <SectionHeader
              eyebrow="The Hands Behind Aurelle"
              title={<>Meet the <em className="text-accent italic font-normal">Atelier</em></>}
              subtitle="A team of designers, technologists, and artisans united by a love for craft."
            />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {TEAM.map((member) => (
                <div key={member.name} className="text-center">
                  <div className="aspect-[3/4] mb-6 overflow-hidden">
                    <ProductPlaceholder
                      productName={member.name}
                      gradient={member.gradient}
                      variant="monogram"
                      showWordmark={false}
                    />
                  </div>
                  <h4 className="font-display text-xl mb-1">{member.name}</h4>
                  <div className="text-xs uppercase tracking-widest text-accent">
                    {member.role}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section bg-ink text-cream text-center">
          <div className="container-padded">
            <h2 className="text-display-lg mb-6 text-cream">
              Begin Your <em className="text-accent italic font-normal">Aurelle Journey</em>
            </h2>
            <p className="text-cream/70 max-w-md mx-auto mb-8 leading-relaxed">
              Discover pieces hand-selected for you by our intelligent atelier.
            </p>
            <div className="flex gap-5 justify-center flex-wrap">
              <Link href="/shop" className="btn btn-light">Explore Collection</Link>
              <Link href="/register" className="btn btn-outline-light">Join the Atelier</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
