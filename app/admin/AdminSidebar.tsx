'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  BarChart3,
  Package,
  ShoppingBag,
  Users,
  Boxes,
  Sparkles,
  TrendingUp,
  Settings,
  ExternalLink,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { confirmDialog } from '@/components/ConfirmDialog';

interface NavItem {
  label: string;
  href: string;
  Icon: typeof LayoutDashboard;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', href: '/admin', Icon: LayoutDashboard },
      { label: 'Analytics', href: '/admin/analytics', Icon: BarChart3 },
    ],
  },
  {
    title: 'Commerce',
    items: [
      { label: 'Products', href: '/admin/products', Icon: Package },
      { label: 'Orders', href: '/admin/orders', Icon: ShoppingBag },
      { label: 'Customers', href: '/admin/customers', Icon: Users },
      { label: 'Inventory', href: '/admin/inventory', Icon: Boxes },
    ],
  },
  {
    title: 'AI Engine',
    items: [
      { label: 'Recommendations', href: '/admin/recommendations', Icon: Sparkles },
      { label: 'Customer Insights', href: '/admin/insights', Icon: TrendingUp },
    ],
  },
];

export function AdminSidebar({ firstName }: { firstName: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Auto-close drawer on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll when drawer is open on mobile
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Close on Esc
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  async function handleLogout() {
    const ok = await confirmDialog({
      title: 'Sign out?',
      message: 'You will be signed out of the admin panel and returned to the sign-in page.',
      confirmLabel: 'Sign Out',
      cancelLabel: 'Stay',
    });
    if (!ok) return;
    await fetch('/api/auth/logout', { method: 'POST' });
    router.replace('/login');
  }

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  // Close drawer immediately on any nav action (don't wait for pathname change)
  const closeDrawer = () => setOpen(false);

  const navContent = (
    <>
      <Link
        href="/"
        onClick={closeDrawer}
        className="block font-display text-3xl px-8 pb-6 border-b border-cream/10"
      >
        Maison <span className="text-accent italic">Aurelle</span>
      </Link>

      <nav className="py-8 flex-1">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title} className="mb-8">
            <div className="text-[10px] uppercase tracking-widest text-cream/40 px-8 mb-4">
              {section.title}
            </div>
            {section.items.map(({ label, href, Icon }) => {
              const active = isActive(href);
              return (
                <Link
                  key={label}
                  href={href}
                  onClick={closeDrawer}
                  className={cn(
                    'flex items-center gap-3 px-8 py-3 text-sm border-l-2 transition-all',
                    active
                      ? 'bg-accent/15 text-accent border-accent'
                      : 'text-cream/70 border-transparent hover:bg-accent/10 hover:text-accent hover:border-accent'
                  )}
                >
                  <Icon size={18} strokeWidth={1.5} />
                  {label}
                </Link>
              );
            })}
          </div>
        ))}

        <div className="mb-8">
          <div className="text-[10px] uppercase tracking-widest text-cream/40 px-8 mb-4">
            System
          </div>
          <Link
            href="/admin/settings"
            onClick={closeDrawer}
            className={cn(
              'flex items-center gap-3 px-8 py-3 text-sm border-l-2 transition-all',
              isActive('/admin/settings')
                ? 'bg-accent/15 text-accent border-accent'
                : 'text-cream/70 border-transparent hover:bg-accent/10 hover:text-accent hover:border-accent'
            )}
          >
            <Settings size={18} strokeWidth={1.5} />
            Settings
          </Link>
          <Link
            href="/"
            onClick={closeDrawer}
            className="flex items-center gap-3 px-8 py-3 text-sm text-cream/70 hover:bg-accent/10 hover:text-accent border-l-2 border-transparent hover:border-accent transition-all"
          >
            <ExternalLink size={18} strokeWidth={1.5} />
            View Site
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-8 py-3 text-sm text-cream/70 hover:bg-error/10 hover:text-error border-l-2 border-transparent hover:border-error transition-all text-left"
          >
            <LogOut size={18} strokeWidth={1.5} />
            Sign Out
          </button>
        </div>
      </nav>

      <div className="px-8 pt-6 border-t border-cream/10 mt-auto">
        <div className="text-xs text-cream/40 uppercase tracking-widest mb-2">
          Signed in as
        </div>
        <div className="text-sm text-cream font-medium">{firstName}</div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top bar — visible only on mobile */}
      <header className="md:hidden sticky top-0 z-30 flex items-center justify-between bg-ink text-cream px-5 py-4 shadow-medium">
        <button
          onClick={() => setOpen(true)}
          className="flex items-center justify-center w-10 h-10 -ml-2 hover:bg-cream/5 transition-colors"
          aria-label="Open admin menu"
        >
          <Menu size={22} />
        </button>
        <Link href="/admin" className="font-display text-xl">
          Maison <span className="text-accent italic">Aurelle</span>
        </Link>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-accent-300 flex items-center justify-center text-cream text-sm font-semibold">
          {firstName[0]?.toUpperCase() ?? 'A'}
        </div>
      </header>

      {/* Desktop sidebar — always visible from md+ */}
      <aside className="hidden md:flex md:flex-col bg-ink text-cream py-8 md:sticky md:top-0 md:h-screen overflow-y-auto scrollbar-thin">
        {navContent}
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden fixed inset-0 bg-ink/60 z-40"
              onClick={() => setOpen(false)}
            />

            {/* Drawer */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="md:hidden fixed inset-y-0 left-0 w-[85%] max-w-[320px] bg-ink text-cream z-50 overflow-y-auto scrollbar-thin py-8 flex flex-col"
            >
              {/* Close button */}
              <button
                onClick={() => setOpen(false)}
                className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center hover:bg-cream/5 transition-colors z-10"
                aria-label="Close menu"
              >
                <X size={22} />
              </button>

              {navContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
