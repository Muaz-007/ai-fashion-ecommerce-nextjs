'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, Minus, Plus, Truck, Star } from 'lucide-react';
import { formatPrice, cn } from '@/lib/utils';
import { useStore } from '@/lib/store';
import { addToLocalCart, localCartCount } from '@/lib/cart';
import { ProductPlaceholder } from '@/components/ProductPlaceholder';

interface Product {
  id: number;
  name: string;
  slug: string;
  sku: string;
  description: string | null;
  material: string | null;
  careInstructions: string | null;
  price: number;
  originalPrice: number | null;
  rating: number;
  reviewCount: number;
  gradient: string | null;
  imageUrl: string | null;
  category: { name: string };
  sizes: { size: string; stock: number }[];
  colors: { colorHex: string; colorName: string | null }[];
  badges: { badgeType: string }[];
  tags: { tag: string }[];
}

export function ProductDetailClient({ product }: { product: Product }) {
  const router = useRouter();
  const { showToast, user, setCartCount, cartCount } = useStore();

  const [selectedSize, setSelectedSize] = useState(product.sizes[0]?.size || 'M');
  const [selectedColor, setSelectedColor] = useState(product.colors[0]?.colorHex || '#B08D5A');
  const [quantity, setQuantity] = useState(1);
  const [thumbIndex, setThumbIndex] = useState(0);
  const [wishlisted, setWishlisted] = useState(false);

  const stars = Math.floor(product.rating);

  async function addToCart() {
    // Guest: store in localStorage
    if (!user) {
      addToLocalCart(product.id, selectedSize, quantity);
      setCartCount(localCartCount());
      showToast('Added to your bag');
      return;
    }

    // Logged in: server cart
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, size: selectedSize, quantity }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Added to your bag');
        setCartCount(cartCount + quantity);
      } else {
        showToast(data.message);
      }
    } catch {
      showToast('Failed to add');
    }
  }

  async function buyNow() {
    await addToCart();
    // Guest users need to sign in to checkout (we collect payment info there)
    const dest = user ? '/checkout' : '/login?redirect=checkout';
    setTimeout(() => router.push(dest), 600);
  }

  async function toggleWishlist() {
    // Guest — store in localStorage (matches ProductCard behavior)
    if (!user) {
      const KEY = 'maison_wishlist_local';
      const raw =
        typeof window !== 'undefined' ? window.localStorage.getItem(KEY) : null;
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
    } catch {}
  }

  const accentColor = product.colors[0]?.colorHex || '#D4B896';

  const thumbs = [
    product.gradient,
    `linear-gradient(160deg, ${product.colors[0]?.colorHex || '#B08D5A'} 0%, ${accentColor} 100%)`,
    `linear-gradient(120deg, ${product.colors[product.colors.length - 1]?.colorHex || '#5A1A2F'} 0%, ${product.colors[0]?.colorHex || '#B08D5A'} 100%)`,
    `linear-gradient(200deg, ${accentColor} 0%, ${product.colors[0]?.colorHex || '#B08D5A'} 100%)`,
  ];

  return (
    <div className="grid md:grid-cols-[1.2fr_1fr] gap-16 lg:gap-20">
      {/* Gallery */}
      <div className="grid md:grid-cols-[80px_1fr] gap-4">
        <div className="hidden md:flex flex-col gap-3">
          {thumbs.map((bg, i) => (
            <button
              key={i}
              onClick={() => setThumbIndex(i)}
              className={cn(
                'aspect-square border-2 overflow-hidden transition-all',
                thumbIndex === i ? 'border-accent' : 'border-transparent hover:border-accent/50'
              )}
            >
              <div style={{ background: bg || '', width: '100%', height: '100%' }} />
            </button>
          ))}
        </div>

        <motion.div
          key={thumbIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="aspect-[3/4] overflow-hidden relative"
        >
          <ProductPlaceholder
            productId={product.id}
            productName={product.name}
            category={product.category.name}
            gradient={thumbs[thumbIndex] || product.gradient}
            imageUrl={thumbIndex === 0 ? product.imageUrl : null}
          />
          {product.badges.length > 0 && (
            <div className="absolute top-6 left-6 flex flex-col gap-2 z-10">
              {product.badges.map((b) => (
                <span
                  key={b.badgeType}
                  className="text-[10px] font-semibold tracking-widest uppercase text-cream px-3 py-1.5 bg-ink"
                >
                  {b.badgeType === 'sale' ? 'Sale' : b.badgeType === 'new' ? 'New' : 'Bestseller'}
                </span>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Info */}
      <div className="py-4 md:sticky md:top-32 md:self-start">
        <div className="text-xs uppercase tracking-widest text-accent mb-3">
          {product.category.name}
        </div>
        <h1 className="font-display text-4xl md:text-5xl mb-4 leading-tight">
          {product.name}
        </h1>

        <div className="flex items-center gap-2 mb-6 text-accent">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={14}
              fill={i < stars ? 'currentColor' : 'none'}
              strokeWidth={1.5}
            />
          ))}
          <span className="text-muted text-sm">
            {product.rating} · {product.reviewCount} reviews
          </span>
        </div>

        <div className="font-display text-3xl mb-8 flex items-baseline gap-4">
          {product.originalPrice ? (
            <>
              <span className="text-error">{formatPrice(product.price)}</span>
              <span className="text-muted-light line-through text-xl">
                {formatPrice(product.originalPrice)}
              </span>
            </>
          ) : (
            <span>{formatPrice(product.price)}</span>
          )}
        </div>

        <p className="text-muted leading-loose mb-8 pb-8 border-b border-border">
          {product.description}
        </p>

        {/* Color */}
        {product.colors.length > 0 && (
          <div className="mb-7">
            <div className="flex justify-between items-center text-xs uppercase tracking-wider mb-4 font-semibold">
              <span>Color</span>
            </div>
            <div className="flex gap-3">
              {product.colors.map((c) => (
                <button
                  key={c.colorHex}
                  onClick={() => setSelectedColor(c.colorHex)}
                  className={cn(
                    'w-9 h-9 rounded-full border-2 transition-all',
                    selectedColor === c.colorHex ? 'border-accent scale-110' : 'border-transparent'
                  )}
                  style={{ background: c.colorHex }}
                  title={c.colorName ?? ''}
                />
              ))}
            </div>
          </div>
        )}

        {/* Size */}
        <div className="mb-7">
          <div className="flex justify-between items-center text-xs uppercase tracking-wider mb-4 font-semibold">
            <span>Size · <span className="text-muted normal-case tracking-normal font-normal">{selectedSize}</span></span>
            <Link
              href="/size-guide"
              target="_blank"
              className="text-accent normal-case tracking-normal font-normal text-sm border-b border-accent hover:opacity-70 transition-opacity"
            >
              Size Guide
            </Link>
          </div>
          <div className="flex gap-3 flex-wrap">
            {product.sizes.map((s) => (
              <button
                key={s.size}
                onClick={() => setSelectedSize(s.size)}
                className={cn(
                  'min-w-[56px] h-12 px-4 border text-sm transition-all',
                  selectedSize === s.size
                    ? 'bg-ink text-cream border-ink'
                    : 'border-border hover:border-ink'
                )}
              >
                {s.size}
              </button>
            ))}
          </div>
        </div>

        {/* Quantity + Add to cart */}
        <div className="flex gap-4 mb-4">
          <div className="flex items-center border border-ink h-[52px]">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-12 h-full flex items-center justify-center text-ink hover:bg-ink hover:text-cream transition-colors"
            >
              <Minus size={16} />
            </button>
            <span className="w-12 text-center font-medium">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-12 h-full flex items-center justify-center text-ink hover:bg-ink hover:text-cream transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>
          <button onClick={addToCart} className="btn btn-primary flex-1">
            Add to Bag
          </button>
          <button
            onClick={toggleWishlist}
            className={cn(
              'w-[52px] h-[52px] border border-ink flex items-center justify-center transition-colors',
              wishlisted ? 'bg-ink text-cream' : 'hover:bg-cream-200'
            )}
          >
            <Heart size={20} fill={wishlisted ? 'currentColor' : 'none'} />
          </button>
        </div>

        <button onClick={buyNow} className="btn btn-secondary w-full">
          Buy Now
        </button>

        {/* Meta */}
        <div className="pt-8 mt-8 border-t border-border space-y-3 text-sm text-muted">
          <div className="flex gap-4">
            <span className="font-semibold text-ink uppercase text-xs tracking-wider min-w-[100px]">SKU</span>
            <span>{product.sku}</span>
          </div>
          {product.material && (
            <div className="flex gap-4">
              <span className="font-semibold text-ink uppercase text-xs tracking-wider min-w-[100px]">Material</span>
              <span>{product.material}</span>
            </div>
          )}
          {product.careInstructions && (
            <div className="flex gap-4">
              <span className="font-semibold text-ink uppercase text-xs tracking-wider min-w-[100px]">Care</span>
              <span>{product.careInstructions}</span>
            </div>
          )}
        </div>

        <div className="mt-6 p-5 bg-cream-200 flex items-center gap-4">
          <Truck size={20} className="text-accent shrink-0" />
          <div className="text-sm text-muted">
            <strong className="text-ink">Estimated delivery:</strong> 3–5 business days nationwide
          </div>
        </div>
      </div>
    </div>
  );
}
