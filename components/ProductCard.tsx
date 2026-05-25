'use client';

import Link from 'next/link';
import { Heart, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { formatPrice, cn } from '@/lib/utils';
import { useStore } from '@/lib/store';
import { addToLocalCart, localCartCount } from '@/lib/cart';
import { ProductPlaceholder } from './ProductPlaceholder';

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    slug: string;
    price: number;
    originalPrice?: number | null;
    gradient?: string | null;
    imageUrl?: string | null;
    rating: number;
    reviewCount: number;
    category: { name: string };
    badges?: { badgeType: string }[];
  };
  index?: number;
  /** Theme of the surrounding section — controls text colors */
  theme?: 'light' | 'dark';
}

const BADGE_LABELS: Record<string, string> = {
  new: 'New',
  sale: 'Sale',
  bestseller: 'Bestseller',
};

const BADGE_COLORS: Record<string, string> = {
  new: 'bg-accent',
  sale: 'bg-error',
  bestseller: 'bg-ink',
};

export function ProductCard({ product, index = 0, theme = 'light' }: ProductCardProps) {
  const { showToast, user } = useStore();
  const [wishlisted, setWishlisted] = useState(false);

  const isDark = theme === 'dark';

  async function toggleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    // Guest: toggle in localStorage
    if (!user) {
      const KEY = 'maison_wishlist_local';
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem(KEY) : null;
      let ids: number[] = [];
      try {
        ids = raw ? JSON.parse(raw) : [];
      } catch {
        ids = [];
      }
      const exists = ids.includes(product.id);
      const next = exists ? ids.filter((id) => id !== product.id) : [...ids, product.id];
      window.localStorage.setItem(KEY, JSON.stringify(next));
      setWishlisted(!exists);
      showToast(exists ? 'Removed from wishlist' : 'Added to wishlist');
      return;
    }

    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id }),
      });
      const data = await res.json();
      if (data.success) {
        setWishlisted(data.data.added);
        showToast(data.message);
      }
    } catch {
      showToast('Failed to update wishlist');
    }
  }

  async function quickAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    // Guest: store locally
    if (!user) {
      addToLocalCart(product.id, 'M', 1);
      useStore.getState().setCartCount(localCartCount());
      showToast('Added to your bag');
      return;
    }

    // Logged in: server-side cart
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, size: 'M', quantity: 1 }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Added to your bag');
        useStore.getState().setCartCount(useStore.getState().cartCount + 1);
      } else {
        showToast(data.message || 'Failed');
      }
    } catch {
      showToast('Failed to add');
    }
  }

  const stars = Math.floor(product.rating);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
      className="group relative"
    >
      <Link href={`/shop/${product.slug}`} className="block">
        {/* Image area */}
        <div
          className={cn(
            'relative aspect-[3/4] overflow-hidden mb-5',
            isDark ? 'bg-ink-50' : 'bg-cream-200'
          )}
        >
          <div className="absolute inset-0 transition-transform duration-700 ease-smooth group-hover:scale-105">
            <ProductPlaceholder
              productId={product.id}
              productName={product.name}
              category={product.category.name}
              gradient={product.gradient}
              imageUrl={product.imageUrl}
            />
          </div>

          {/* Badges */}
          {product.badges && product.badges.length > 0 && (
            <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
              {product.badges.map((badge) => (
                <span
                  key={badge.badgeType}
                  className={cn(
                    'text-[10px] font-semibold tracking-widest uppercase text-cream px-3 py-1.5',
                    BADGE_COLORS[badge.badgeType] || 'bg-ink'
                  )}
                >
                  {BADGE_LABELS[badge.badgeType]}
                </span>
              ))}
            </div>
          )}

          {/* Quick actions — wishlist only; whole card is already clickable */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 z-10 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
            <button
              onClick={toggleWishlist}
              className={cn(
                'w-10 h-10 rounded-full bg-cream flex items-center justify-center shadow-soft transition-all hover:scale-110',
                wishlisted ? 'text-error' : 'text-ink hover:bg-ink hover:text-cream'
              )}
              aria-label="Toggle wishlist"
            >
              <Heart size={16} fill={wishlisted ? 'currentColor' : 'none'} />
            </button>
          </div>

          {/* Add to cart on hover */}
          <button
            onClick={quickAdd}
            className={cn(
              'absolute bottom-0 left-0 right-0 py-3.5 text-[11px] uppercase tracking-wider font-medium translate-y-full group-hover:translate-y-0 transition-transform duration-300 hover:bg-accent z-10',
              isDark ? 'bg-cream text-ink hover:text-cream' : 'bg-ink text-cream'
            )}
          >
            + Add to Bag
          </button>
        </div>

        {/* Info — no hard background, blends with section */}
        <div className="px-1">
          <div
            className={cn(
              'text-[11px] uppercase tracking-widest mb-2',
              isDark ? 'text-cream/50' : 'text-muted-light'
            )}
          >
            {product.category.name}
          </div>
          <h3
            className={cn(
              'font-display text-xl mb-2 leading-tight transition-colors group-hover:text-accent',
              isDark ? 'text-cream' : 'text-ink'
            )}
          >
            {product.name}
          </h3>
          <div
            className={cn(
              'flex items-center gap-3 font-medium',
              isDark ? 'text-cream' : 'text-ink'
            )}
          >
            {product.originalPrice ? (
              <>
                <span className={isDark ? 'text-accent-light' : 'text-error'}>
                  {formatPrice(product.price)}
                </span>
                <span
                  className={cn(
                    'line-through font-normal text-sm',
                    isDark ? 'text-cream/40' : 'text-muted-light'
                  )}
                >
                  {formatPrice(product.originalPrice)}
                </span>
              </>
            ) : (
              <span>{formatPrice(product.price)}</span>
            )}
          </div>
          <div className="flex items-center gap-1 mt-2 text-accent text-sm">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={12}
                fill={i < stars ? 'currentColor' : 'none'}
                strokeWidth={1.5}
              />
            ))}
            <span
              className={cn(
                'text-xs ml-1.5',
                isDark ? 'text-cream/40' : 'text-muted-light'
              )}
            >
              ({product.reviewCount})
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
