import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Toast } from '@/components/Toast';
import { CheckoutClient } from './CheckoutClient';

export default function CheckoutPage() {
  return (
    <>
      <Header />
      <Toast />
      <main>
        <section className="pt-44 md:pt-52 pb-12 text-center bg-gradient-to-b from-cream-200 to-cream">
          <div className="container-padded">
            <div className="eyebrow mb-4">Almost There</div>
            <h1 className="text-display-xl">
              Secure <em className="text-accent italic font-normal">Checkout</em>
            </h1>
          </div>
        </section>

        <CheckoutClient />
      </main>
      <Footer />
    </>
  );
}
