'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, User, ShoppingBag, Menu, X, LogOut, LayoutDashboard, ArrowRight, Mail, Instagram, UserPlus } from 'lucide-react';
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

  // Portal mount flag — drawer renders at document.body to escape
  // the header's `backdrop-blur-md` containing block (which would
  // otherwise constrain fixed-positioned children to header bounds).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

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
          {/* Search — visible on all screens (replaces account icon on mobile) */}
          <button
            onClick={() => setSearchOpen(true)}
            className="nav-icon-btn"
            aria-label="Search"
          >
            <Search size={20} />
          </button>

          {/* Account icon — desktop only (mobile uses drawer's account section) */}
          {user ? (
            <div className="relative hidden md:block">
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
            <Link href="/login" className="nav-icon-btn hidden md:flex" aria-label="Sign in">
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

      {/* Search overlay — only mounted after first open (keeps initial bundle lean) */}
      {searchOpen && (
        <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      )}

      {/* Mobile drawer — portaled to document.body to escape header's
          backdrop-filter containing block (CSS spec quirk that would
          otherwise constrain fixed children to header bounds) */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {mobileOpen && (
              <>
                {/* Dim + blur backdrop covering the whole page */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="md:hidden fixed inset-0 bg-ink/60 backdrop-blur-sm z-[100]"
                  onClick={() => setMobileOpen(false)}
                />

                {/* Drawer */}
                <motion.aside
                  initial={{ x: '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '-100%' }}
                  transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
                  className="md:hidden fixed inset-y-0 left-0 w-[75%] max-w-[300px] bg-cream z-[101] flex flex-col shadow-large overflow-y-auto"
                >
                  {/* Header strip */}
                  <div className="flex justify-between items-center px-6 py-5 border-b border-border">
                    <Link
                      href="/"
                      onClick={() => setMobileOpen(false)}
                      className="font-display text-2xl"
                    >
                      Maison <span className="text-accent italic">Aurelle</span>
                    </Link>
                    <button
                      className="nav-icon-btn"
                      onClick={() => setMobileOpen(false)}
                      aria-label="Close menu"
                    >
                      <X size={22} />
                    </button>
                  </div>

                  {/* Account section */}
                  {user ? (
                    <div className="px-6 py-5 border-b border-border bg-gradient-to-br from-cream-200/60 to-cream">
                      <div className="text-[10px] uppercase tracking-[0.25em] text-accent mb-1 font-medium">
                        Signed in as
                      </div>
                      <div className="font-display text-xl mb-4">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="space-y-2">
                        {user.role === 'admin' && (
                          <Link
                            href="/admin"
                            onClick={() => setMobileOpen(false)}
                            className="flex items-center gap-2.5 text-sm text-accent hover:translate-x-1 transition-transform"
                          >
                            <LayoutDashboard size={14} /> Admin Dashboard
                          </Link>
                        )}
                        <Link
                          href="/cart"
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-2.5 text-sm hover:translate-x-1 transition-transform"
                        >
                          <ShoppingBag size={14} /> My Bag
                          {cartCount > 0 && (
                            <span className="text-[10px] text-accent">({cartCount})</span>
                          )}
                        </Link>
                        <button
                          onClick={() => {
                            setMobileOpen(false);
                            handleLogout();
                          }}
                          className="flex items-center gap-2.5 text-sm text-error hover:translate-x-1 transition-transform"
                        >
                          <LogOut size={14} /> Sign Out
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="px-6 py-5 border-b border-border bg-gradient-to-br from-cream-200/60 to-cream">
                      <div className="text-[10px] uppercase tracking-[0.25em] text-accent mb-2 font-medium">
                        Your Atelier Account
                      </div>
                      <p className="text-xs text-muted leading-relaxed mb-4">
                        Sign in for AI-curated picks, saved addresses &amp; faster checkout.
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <Link
                          href="/login"
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center justify-center gap-2 py-2.5 bg-ink text-cream text-[10px] uppercase tracking-widest font-medium"
                        >
                          <User size={12} /> Sign In
                        </Link>
                        <Link
                          href="/register"
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center justify-center gap-2 py-2.5 bg-transparent text-ink border border-ink text-[10px] uppercase tracking-widest font-medium"
                        >
                          <UserPlus size={12} /> Register
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* Section heading */}
                  <div className="px-6 pt-6 pb-3">
                    <div className="text-[10px] uppercase tracking-[0.3em] text-muted-light font-medium">
                      Browse
                    </div>
                  </div>

                  {/* Nav links */}
                  <ul className="flex-1 px-6 pb-6">
                    {NAV_LINKS.map((link) => {
                      const active = isActive(link.href);
                      return (
                        <li key={link.href}>
                          <Link
                            href={link.href}
                            onClick={() => setMobileOpen(false)}
                            className={cn(
                              'group flex items-center justify-between py-3.5 border-b border-border/60 text-sm font-medium tracking-wider uppercase transition-colors',
                              active ? 'text-accent' : 'text-ink hover:text-accent'
                            )}
                          >
                            <span>{link.label}</span>
                            <ArrowRight
                              size={14}
                              className={cn(
                                'transition-all',
                                active
                                  ? 'opacity-100 text-accent'
                                  : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'
                              )}
                            />
                          </Link>
                        </li>
                      );
                    })}
                  </ul>

                  {/* Bottom decorative section */}
                  <div className="px-6 py-6 border-t border-border bg-ink text-cream">
                    <p
                      className="text-center text-2xl mb-4 text-cream/90"
                      style={{ fontFamily: 'var(--font-script)' }}
                    >
                      an atelier where heritage breathes
                    </p>
                    <div className="flex items-center justify-center gap-5 text-cream/60">
                      <a
                        href="mailto:hello@maisonaurelle.pk"
                        className="hover:text-accent transition-colors"
                        aria-label="Email"
                      >
                        <Mail size={16} />
                      </a>
                      <span className="w-1 h-1 rounded-full bg-cream/30" />
                      <a
                        href="https://instagram.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-accent transition-colors"
                        aria-label="Instagram"
                      >
                        <Instagram size={16} />
                      </a>
                    </div>
                    <div className="text-center mt-4 text-[9px] uppercase tracking-[0.3em] text-cream/40">
                      Est. 2026 · Lahore
                    </div>
                  </div>
                </motion.aside>
              </>
            )}
          </AnimatePresence>,
          document.body
        )}
    </header>
  );
}
