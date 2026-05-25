'use client';

import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Minus, Plus, Trash2, ShoppingBag, Lock } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useStore } from '@/lib/store';
import { ProductPlaceholder } from '@/components/ProductPlaceholder';
import {
  readLocalCart,
  removeFromLocalCart,
  updateLocalCartQty,
  localCartCount,
} from '@/lib/cart';

interface CartItem {
  id: number | string;
  productId: number;
  size: string;
  quantity: number;
  line_total?: number;
  product: {
    id: number;
    name: string;
    slug: string;
    price: number;
    gradient: string | null;
    category: { name: string };
  };
}

interface CartData {
  items: CartItem[];
  count: number;
  totals: { subtotal: number; shipping: number; tax: number; total: number };
}

export function CartClient() {
  const { user, setCartCount, showToast } = useStore();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<CartData | null>(null);

  const loadCart = useCallback(async () => {
    setLoading(true);
    try {
      if (user) {
        // Logged in — fetch server cart
        const res = await fetch('/api/cart');
        const result = await res.json();
        if (result.success) {
          setData(result.data);
          setCartCount(result.data.count);
        }
      } else {
        // Guest — enrich localStorage cart with product details
        const localItems = readLocalCart();
        if (localItems.length === 0) {
          setData({ items: [], count: 0, totals: { subtotal: 0, shipping: 0, tax: 0, total: 0 } });
          setCartCount(0);
        } else {
          const res = await fetch('/api/cart/enrich', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: localItems }),
          });
          const result = await res.json();
          if (result.success) {
            setData(result.data);
            setCartCount(localCartCount());
          }
        }
      }
    } finally {
      setLoading(false);
    }
  }, [user, setCartCount]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  async function updateQty(item: CartItem, quantity: number) {
    if (user) {
      const res = await fetch('/api/cart', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartId: item.id, quantity }),
      });
      const result = await res.json();
      if (result.success) loadCart();
      else showToast(result.message);
    } else {
      updateLocalCartQty(item.productId, item.size, quantity);
      loadCart();
    }
  }

  async function removeItem(item: CartItem) {
    if (user) {
      const res = await fetch(`/api/cart?id=${item.id}`, { method: 'DELETE' });
      const result = await res.json();
      if (result.success) {
        showToast('Removed from your bag');
        loadCart();
      }
    } else {
      removeFromLocalCart(item.productId, item.size);
      showToast('Removed from your bag');
      loadCart();
    }
  }

  if (loading) {
    return (
      <div className="container-padded py-24 text-center text-muted">Loading your bag…</div>
    );
  }

  // Empty cart (works for both guest & logged-in)
  if (!data || data.items.length === 0) {
    return (
      <div className="container-padded py-24 text-center">
        <ShoppingBag size={64} className="mx-auto mb-6 text-muted-light" strokeWidth={1} />
        <h2 className="font-display text-4xl mb-4">
          Your bag is <em className="text-accent italic font-normal">empty</em>
        </h2>
        <p className="text-muted mb-8 max-w-md mx-auto">
          Start exploring our curated collections — pieces handcrafted just for you.
        </p>
        <Link href="/shop" className="btn btn-primary">
          Discover the Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="container-padded py-12">
      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-16 items-start">
        {/* Items */}
        <div>
          <div className="flex justify-between items-baseline mb-6">
            <h3 className="font-display text-2xl">
              {data.items.length} {data.items.length === 1 ? 'Item' : 'Items'}
            </h3>
            <Link
              href="/shop"
              className="text-sm text-accent border-b border-accent hover:opacity-70 transition-opacity"
            >
              Continue Shopping
            </Link>
          </div>

          <div className="border-t border-border">
            {data.items.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="grid grid-cols-[120px_1fr_auto] gap-6 py-8 border-b border-border items-center"
              >
                <Link href={`/shop/${item.product.slug}`}>
                  <div className="aspect-[3/4] overflow-hidden">
                    <ProductPlaceholder
                      productId={item.product.id}
                      productName={item.product.name}
                      category={item.product.category.name}
                      gradient={item.product.gradient}
                    />
                  </div>
                </Link>
                <div className="flex flex-col gap-2 min-w-0">
                  <div className="text-[10px] uppercase tracking-widest text-muted-light">
                    {item.product.category.name}
                  </div>
                  <Link href={`/shop/${item.product.slug}`}>
                    <h4 className="font-display text-xl">{item.product.name}</h4>
                  </Link>
                  <div className="text-sm text-muted">Size: {item.size}</div>
                  <div className="font-medium mt-1">
                    {formatPrice(item.product.price * item.quantity)}
                  </div>
                </div>
                <div className="flex flex-col gap-4 items-end">
                  <div className="flex items-center border border-ink h-10">
                    <button
                      onClick={() => updateQty(item, item.quantity - 1)}
                      className="w-9 h-full flex items-center justify-center hover:bg-ink hover:text-cream transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-10 text-center text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQty(item, item.quantity + 1)}
                      className="w-9 h-full flex items-center justify-center hover:bg-ink hover:text-cream transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item)}
                    className="text-muted-light hover:text-error transition-colors"
                    aria-label="Remove"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <aside className="bg-cream-200 p-10 sticky top-32 self-start">
          <h3 className="font-display text-2xl mb-6 pb-6 border-b border-border">
            Order Summary
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between text-muted">
              <span>Subtotal</span>
              <span>{formatPrice(data.totals.subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted">
              <span>Shipping</span>
              <span>
                {data.totals.shipping === 0 ? 'Complimentary' : formatPrice(data.totals.shipping)}
              </span>
            </div>
            <div className="flex justify-between text-muted">
              <span>Tax (5%)</span>
              <span>{formatPrice(data.totals.tax)}</span>
            </div>
          </div>

          <div className="flex justify-between pt-5 mt-5 border-t border-border font-display text-2xl">
            <span>Total</span>
            <span>{formatPrice(data.totals.total)}</span>
          </div>

          <Link href="/checkout" className="btn btn-primary w-full mt-6">
            Proceed to Checkout
          </Link>
          {!user && (
            <p className="text-xs text-muted text-center mt-3">
              Checkout as guest or{' '}
              <Link
                href="/login?redirect=checkout"
                className="text-accent border-b border-accent"
              >
                sign in
              </Link>
            </p>
          )}

          <div className="mt-6 text-xs text-muted text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Lock size={12} />
              Secure 256-bit SSL encrypted checkout
            </div>
            <div>We accept all major cards & digital wallets</div>
          </div>
        </aside>
      </div>
    </div>
  );
}
