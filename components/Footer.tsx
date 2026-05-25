'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useStore } from '@/lib/store';

const FOOTER_LINKS = {
  Shop: [
    { label: 'Pret', href: '/shop?category=Pret' },
    { label: 'Formal', href: '/shop?category=Formal' },
    { label: 'Bridal', href: '/shop?category=Bridal' },
    { label: 'Accessories', href: '/shop?category=Accessories' },
    { label: 'All Products', href: '/shop' },
  ],
  Account: [
    { label: 'Sign In', href: '/login' },
    { label: 'Create Account', href: '/register' },
    { label: 'My Bag', href: '/cart' },
    { label: 'Checkout', href: '/checkout' },
  ],
  Atelier: [
    { label: 'Our Story', href: '/about' },
    { label: 'Size Guide', href: '/size-guide' },
    { label: 'Contact', href: '/contact' },
  ],
};

export function Footer() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useStore();

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Welcome to the Atelier');
        setEmail('');
      } else {
        showToast(data.message || 'Subscription failed');
      }
    } catch {
      showToast('Subscription failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <footer className="bg-ink text-cream pt-20 pb-6">
      <div className="container-padded">
        <div className="grid md:grid-cols-[1.5fr_1fr_1fr_1fr] gap-12 mb-16">
          {/* Brand */}
          <div>
            <h3 className="font-display text-3xl mb-4 text-cream">
              Maison <span className="text-accent italic">Aurelle</span>
            </h3>
            <p className="text-cream/70 leading-relaxed mb-6 max-w-sm">
              An AI-integrated fashion atelier where Pakistani heritage meets contemporary intelligence. Crafted in Lahore, worn worldwide.
            </p>

            {/* Newsletter form */}
            <form onSubmit={handleSubscribe} className="flex border-b border-cream/30 max-w-sm">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Subscribe to our newsletter"
                className="flex-1 py-3 bg-transparent border-0 text-cream placeholder:text-cream/50 focus:outline-none text-sm"
                required
              />
              <button
                type="submit"
                disabled={submitting}
                className="px-3 text-cream hover:text-accent transition-colors text-xs uppercase tracking-wider font-medium disabled:opacity-50"
              >
                {submitting ? '...' : 'Join'}
              </button>
            </form>

          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <h5 className="font-body text-xs uppercase tracking-widest mb-6 font-semibold">
                {heading}
              </h5>
              <ul className="space-y-3.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-cream/70 text-sm hover:text-accent transition-all hover:pl-2"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-6 border-t border-cream/10 flex flex-wrap justify-between items-center gap-4 text-cream/50 text-sm">
          <div>&copy; {new Date().getFullYear()} Maison Aurelle. Crafted in Lahore, worn worldwide.</div>
          <div className="flex gap-8">
            <Link href="/privacy" className="hover:text-accent transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-accent transition-colors">Terms</Link>
            <Link href="/cookies" className="hover:text-accent transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
