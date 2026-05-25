import { Suspense } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function NotFound() {
  return (
    <>
      <Suspense fallback={<div className="h-32" />}>
        <Header />
      </Suspense>
      <main id="main-content" className="min-h-[60vh] flex items-center">
        <div className="container-padded text-center py-24">
          <div className="font-display text-[10rem] text-accent/20 leading-none mb-4">
            404
          </div>
          <h1 className="font-display text-5xl mb-6">
            Page <em className="text-accent italic font-normal">Not Found</em>
          </h1>
          <p className="text-muted max-w-md mx-auto mb-10 leading-relaxed">
            The page you&apos;re looking for seems to have wandered off the runway.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/" className="btn btn-primary">Return Home</Link>
            <Link href="/shop" className="btn btn-secondary">Browse Shop</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
