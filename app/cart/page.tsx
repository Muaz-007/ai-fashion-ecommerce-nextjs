import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Toast } from '@/components/Toast';
import { CartClient } from './CartClient';

export default function CartPage() {
  return (
    <>
      <Header />
      <Toast />
      <main id="main-content">
        <section className="pt-44 md:pt-52 pb-16 text-center bg-gradient-to-b from-cream-200 to-cream">
          <div className="container-padded">
            <div className="eyebrow mb-4">Your Selection</div>
            <h1 className="text-display-xl">
              The <em className="text-accent italic font-normal">Shopping Bag</em>
            </h1>
          </div>
        </section>

        <CartClient />
      </main>
      <Footer />
    </>
  );
}
