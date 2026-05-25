'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Instagram, Mail, MapPin } from 'lucide-react';
import { useStore } from '@/lib/store';

const FOOTER_LINKS = {
  Shop: [
    { label: 'Pret', href: '/shop?category=Pret' },
    { label: 'Formal', href: '/shop?category=Formal' },
    { label: 'Bridal', href: '/shop?category=Bridal' },
    { label: 'Accessories', href: '/shop?category=Accessories' },
    { label: 'All Products', href: '/shop' },
  ],
  Atelier: [
    { label: 'Our Story', href: '/about' },
    { label: 'Size Guide', href: '/size-guide' },
    { label: 'Contact', href: '/contact' },
  ],
  Account: [
    { label: 'Sign In', href: '/login' },
    { label: 'Create Account', href: '/register' },
    { label: 'My Bag', href: '/cart' },
    { label: 'Checkout', href: '/checkout' },
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
    <footer className="bg-ink text-cream pt-16 md:pt-20 pb-6">
      <div className="container-padded">
        {/* ============================================
            MOBILE LAYOUT — editorial, compact
            ============================================ */}
        <div className="md:hidden">
          {/* Brand stamp — centered, premium */}
          <div className="text-center mb-10">
            <h3 className="font-display text-3xl mb-3">
              Maison <span className="text-accent italic">Aurelle</span>
            </h3>
            <div className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.3em] text-cream/50">
              <span className="w-6 h-px bg-accent/40" />
              Est. 2026 · Lahore
              <span className="w-6 h-px bg-accent/40" />
            </div>
          </div>

          {/* Newsletter — featured, not buried */}
          <div className="bg-cream/[0.04] border border-cream/10 px-5 py-6 mb-10">
            <div className="text-center mb-4">
              <div className="text-[10px] uppercase tracking-widest text-accent mb-2 font-medium">
                The Atelier Letter
              </div>
              <p className="text-cream/70 text-sm leading-relaxed">
                Private previews, season edits &amp; quiet stories from our atelier.
              </p>
            </div>
            <form onSubmit={handleSubscribe} className="flex border-b border-cream/30">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 py-3 bg-transparent border-0 text-cream placeholder:text-cream/40 focus:outline-none text-sm"
                required
              />
              <button
                type="submit"
                disabled={submitting}
                className="px-3 text-accent hover:text-cream transition-colors text-xs uppercase tracking-wider font-medium disabled:opacity-50"
              >
                {submitting ? '...' : 'Join'}
              </button>
            </form>
          </div>

          {/* Two-column link grid — Shop + Atelier (Account skipped, already in header nav) */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-8 mb-10">
            <div>
              <h5 className="font-body text-[10px] uppercase tracking-widest mb-4 text-accent font-semibold">
                Shop
              </h5>
              <ul className="space-y-3">
                {FOOTER_LINKS.Shop.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-cream/70 text-sm hover:text-accent transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h5 className="font-body text-[10px] uppercase tracking-widest mb-4 text-accent font-semibold">
                Atelier
              </h5>
              <ul className="space-y-3">
                {FOOTER_LINKS.Atelier.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-cream/70 text-sm hover:text-accent transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Contact strip — icons + info */}
          <div className="border-t border-cream/10 py-6 space-y-3">
            <a
              href="mailto:hello@maisonaurelle.pk"
              className="flex items-center gap-3 text-sm text-cream/70 hover:text-accent transition-colors"
            >
              <Mail size={14} className="text-accent" />
              hello@maisonaurelle.pk
            </a>
            <div className="flex items-center gap-3 text-sm text-cream/70">
              <MapPin size={14} className="text-accent" />
              Gulberg III, Lahore, Pakistan
            </div>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-sm text-cream/70 hover:text-accent transition-colors"
            >
              <Instagram size={14} className="text-accent" />
              @maisonaurelle
            </a>
          </div>

          {/* Bottom bar — copyright + policy */}
          <div className="pt-6 border-t border-cream/10 text-center space-y-3">
            <div className="flex justify-center gap-6 text-xs text-cream/50">
              <Link href="/privacy" className="hover:text-accent transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-accent transition-colors">Terms</Link>
              <Link href="/cookies" className="hover:text-accent transition-colors">Cookies</Link>
            </div>
            <div className="text-xs text-cream/40 leading-relaxed px-4">
              &copy; {new Date().getFullYear()} Maison Aurelle.<br />
              Crafted in Lahore, worn worldwide.
            </div>
          </div>
        </div>

        {/* ============================================
            DESKTOP LAYOUT — unchanged 4-column grid
            ============================================ */}
        <div className="hidden md:block">
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
      </div>
    </footer>
  );
}
