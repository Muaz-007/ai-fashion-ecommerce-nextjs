'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, User, ShoppingBag, Menu, X, LogOut, LayoutDashboard } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { localCartCount, syncLocalCartToServer } from '@/lib/cart';

// Lazy-load search overlay — only fetched when user actually opens search
// Saves ~30kb (framer-motion already paid for elsewhere, but SearchOverlay's logic + ProductPlaceholder swaps + product card)
const SearchOverlay = dynamic(
  () => import('./SearchOverlay').then((m) => m.SearchOverlay),
  { ssr: false }
);

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/shop' },
  { label: 'Bridal', href: '/shop?category=Bridal' },
  { label: 'Atelier', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

// Outer Header wraps the inner one in Suspense — required because
// useSearchParams() suspends during static prerender (Next.js 15 behavior).
export function Header() {
  return (
    <Suspense
      fallback={
        <div className="fixed top-0 left-0 right-0 z-50 bg-cream/95 backdrop-blur-md h-[88px] border-b border-transparent" />
      }
    >
      <HeaderInner />
    </Suspense>
  );
}

function HeaderInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, cartCount, setUser, setCartCount } = useStore();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Load session + cart count on mount.
  // Show local cart count immediately (synchronous) so the badge doesn't flash empty.
  useEffect(() => {
    let active = true;
    setCartCount(localCartCount());

    (async () => {
      try {
        // Fire both requests in parallel — auth/me has cache headers so this is fast
        const [meRes, cartRes] = await Promise.all([
          fetch('/api/auth/me').then((r) => r.json()),
          fetch('/api/cart?count=true').then((r) => r.json()).catch(() => null),
        ]);

        if (!active) return;

        if (meRes.success && meRes.data?.user) {
          setUser(meRes.data.user);
          // Sync guest cart into server cart (no-op if empty)
          await syncLocalCartToServer();
          // Re-fetch count after sync
          const finalCount = await fetch('/api/cart?count=true').then((r) => r.json());
          if (active && finalCount.success) setCartCount(finalCount.data.count);
        } else if (cartRes?.success) {
          // Logged out but server returned a count (would be 0) — prefer local
          setCartCount(localCartCount());
        }
      } catch {
        setCartCount(localCartCount());
      }
    })();

    return () => {
      active = false;
    };
  }, [setUser, setCartCount]);

  // Header scroll effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setAccountOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setCartCount(0);
    setAccountOpen(false);
    window.location.href = '/';
  }

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';

    const [hrefPath, hrefQuery] = href.split('?');
    if (pathname !== hrefPath) return false;

    const currentCategory = searchParams.get('category');

    if (hrefQuery) {
      // Link points to a specific category — match only when that category is active
      const linkParams = new URLSearchParams(hrefQuery);
      return linkParams.get('category') === currentCategory;
    }

    // Plain link (no query) — active only when no category filter is set
    if (hrefPath === '/shop') return !currentCategory;

    return true;
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 bg-cream/95 backdrop-blur-md transition-all',
        scrolled ? 'border-b border-border shadow-soft' : 'border-b border-transparent'
      )}
    >
      {/* Announcement bar */}
      <div className="bg-ink text-cream text-center py-2.5 text-[11px] tracking-widest uppercase">
        Complimentary Shipping on Orders Above PKR 10,000 · Crafted in Pakistan
      </div>

      {/* Main nav */}
      <nav className="grid grid-cols-[1fr_auto_1fr] items-center px-5 sm:px-8 py-5 max-w-container mx-auto gap-8">
        {/* Mobile menu button (left) */}
        <button
          className="md:hidden nav-icon-btn justify-self-start"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>

        {/* Desktop links (left) */}
        <ul className="hidden md:flex gap-10 items-center">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  'relative text-xs uppercase tracking-wider font-medium transition-colors py-2',
                  isActive(link.href) ? 'text-accent' : 'text-ink hover:text-accent'
                )}
              >
                {link.label}
                {isActive(link.href) && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute -bottom-0 left-0 right-0 h-px bg-accent"
                  />
                )}
              </Link>
            </li>
          ))}
        </ul>

        {/* Logo (center) */}
        <Link href="/" className="text-center font-display text-2xl md:text-[1.75rem] font-medium tracking-wide">
          Maison <span className="text-accent italic">Aurelle</span>
        </Link>

        {/* Actions (right) */}
        <div className="flex justify-end items-center gap-4">
          <button
            onClick={() => setSearchOpen(true)}
            className="nav-icon-btn hidden md:flex"
            aria-label="Search"
          >
            <Search size={20} />
          </button>

          {/* Account icon — dropdown if logged in, link if not */}
          {user ? (
            <div className="relative">
              <button
                className="nav-icon-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setAccountOpen((o) => !o);
                }}
                aria-label="Account menu"
              >
                <User size={20} />
              </button>

              <AnimatePresence>
                {accountOpen && (
                  <>
                    {/* Overlay to close on outside click */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setAccountOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 min-w-[220px] bg-cream border border-border shadow-medium z-50"
                    >
                      <div className="px-5 py-3 border-b border-border">
                        <div className="text-[10px] uppercase tracking-widest text-muted">
                          Signed in as
                        </div>
                        <div className="font-medium mt-0.5">
                          {user.firstName} {user.lastName}
                        </div>
                      </div>

                      {user.role === 'admin' && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-2.5 px-5 py-2.5 text-sm text-accent hover:bg-cream-200 transition-colors"
                        >
                          <LayoutDashboard size={14} /> Admin Dashboard
                        </Link>
                      )}

                      <Link
                        href="/cart"
                        className="flex items-center gap-2.5 px-5 py-2.5 text-sm hover:bg-cream-200 transition-colors"
                      >
                        <ShoppingBag size={14} /> My Bag
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-5 py-2.5 text-sm text-error border-t border-border hover:bg-cream-200 transition-colors"
                      >
                        <LogOut size={14} /> Sign Out
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link href="/login" className="nav-icon-btn" aria-label="Sign in">
              <User size={20} />
            </Link>
          )}

          {/* Cart icon */}
          <Link href="/cart" className="nav-icon-btn" aria-label="Bag">
            <ShoppingBag size={20} />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>
        </div>
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 bg-ink/30 z-40"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
              className="md:hidden fixed inset-y-0 left-0 w-[80%] max-w-sm bg-cream z-50 flex flex-col"
            >
              <div className="flex justify-between items-center p-6 border-b border-border">
                <span className="font-display text-xl">
                  Maison <span className="text-accent italic">Aurelle</span>
                </span>
                <button
                  className="nav-icon-btn"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                >
                  <X size={22} />
                </button>
              </div>

              <ul className="flex flex-col p-6 gap-5">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm font-medium tracking-wider uppercase"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      setTimeout(() => setSearchOpen(true), 250);
                    }}
                    className="flex items-center gap-3 text-sm font-medium tracking-wider uppercase text-accent"
                  >
                    <Search size={16} /> Search
                  </button>
                </li>
              </ul>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Search overlay — only mounted after first open (keeps initial bundle lean) */}
      {searchOpen && (
        <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      )}
    </header>
  );
}
