import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Toast } from '@/components/Toast';
import { SizeGuideClient } from './SizeGuideClient';

export const metadata = { title: 'Size Guide' };
export const dynamic = 'force-static';

export default function SizeGuidePage() {
  return (
    <>
      <Header />
      <Toast />
      <main id="main-content">
        <section className="pt-44 md:pt-52 pb-16 text-center bg-gradient-to-b from-cream-200 to-cream">
          <div className="container-padded">
            <div className="eyebrow mb-5">Finding Your Fit</div>
            <h1 className="text-display-xl mb-6 max-w-3xl mx-auto text-balance">
              Size <em className="text-accent italic font-normal">Guide</em>
            </h1>
            <p className="text-muted text-lg max-w-2xl mx-auto leading-relaxed">
              Every Maison Aurelle piece is hand-tailored to flatter. Use this guide to find a fit that feels effortless.
            </p>
          </div>
        </section>

        <SizeGuideClient />
      </main>
      <Footer />
    </>
  );
}
