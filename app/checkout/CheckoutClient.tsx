'use client';

import { useEffect, useState, useCallback, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Smartphone, Building, Banknote, Lock, User, UserPlus } from 'lucide-react';
import { formatPrice, cn } from '@/lib/utils';
import { useStore } from '@/lib/store';
import { ProductPlaceholder } from '@/components/ProductPlaceholder';
import { readLocalCart, clearLocalCart } from '@/lib/cart';

interface CartData {
  items: Array<{
    id: number | string;
    quantity: number;
    size: string;
    productId?: number;
    product: { id: number; name: string; price: number; gradient: string | null; category: { name: string } };
  }>;
  totals: { subtotal: number; shipping: number; tax: number; total: number };
}

const PAYMENT_METHODS = [
  { id: 'card', label: 'Credit / Debit Card', description: 'Visa, Mastercard, American Express', Icon: CreditCard },
  { id: 'jazzcash', label: 'JazzCash / EasyPaisa', description: 'Mobile wallet payment', Icon: Smartphone },
  { id: 'bank_transfer', label: 'Bank Transfer', description: 'Direct bank deposit', Icon: Building },
  { id: 'cod', label: 'Cash on Delivery', description: 'Pay when you receive', Icon: Banknote },
] as const;

export function CheckoutClient() {
  const router = useRouter();
  const { user, showToast, setCartCount } = useStore();

  const [cart, setCart] = useState<CartData | null>(null);
  const [payment, setPayment] = useState<typeof PAYMENT_METHODS[number]['id']>('card');
  const [submitting, setSubmitting] = useState(false);

  // Post-order state — drives the success/account-creation UI
  const [completed, setCompleted] = useState<{
    orderNumber: string;
    email: string;
    isGuest: boolean;
  } | null>(null);

  const loadCart = useCallback(async () => {
    if (user) {
      const res = await fetch('/api/cart');
      const result = await res.json();
      if (result.success) {
        if (result.data.items.length === 0) {
          router.replace('/cart');
        } else {
          setCart(result.data);
        }
      }
    } else {
      const localItems = readLocalCart();
      if (localItems.length === 0) {
        router.replace('/cart');
        return;
      }
      const res = await fetch('/api/cart/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: localItems }),
      });
      const result = await res.json();
      if (result.success) setCart(result.data);
    }
  }, [user, router]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  async function placeOrder(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);

    const payload: Record<string, unknown> = {
      shippingEmail: fd.get('email'),
      shippingPhone: fd.get('phone'),
      shippingFirstName: fd.get('firstName'),
      shippingLastName: fd.get('lastName'),
      shippingStreet: fd.get('street'),
      shippingCity: fd.get('city'),
      shippingPostalCode: fd.get('postal'),
      shippingCountry: fd.get('country') || 'Pakistan',
      paymentMethod: payment,
    };

    // For guests, include the cart items in the order request
    if (!user) {
      payload.items = readLocalCart();
    }

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        if (!user) clearLocalCart();
        setCartCount(0);
        setCompleted({
          orderNumber: data.data.orderNumber,
          email: data.data.email,
          isGuest: data.data.isGuest,
        });
      } else {
        showToast(data.message || 'Order failed');
        setSubmitting(false);
      }
    } catch {
      showToast('Order failed. Please try again.');
      setSubmitting(false);
    }
  }

  // ---------- POST-ORDER SUCCESS VIEW ----------
  if (completed) {
    return <OrderSuccess {...completed} />;
  }

  if (!cart) {
    return <div className="container-padded py-24 text-center text-muted">Loading...</div>;
  }

  return (
    <div className="container-padded py-12">
      {/* Guest banner — soft, non-blocking sign-in prompt */}
      {!user && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-wrap items-center justify-between gap-3 bg-cream-200 border border-border px-5 py-4"
        >
          <div className="flex items-center gap-3 text-sm">
            <User size={16} className="text-accent" />
            <span className="text-muted">
              Checking out as a guest.{' '}
              <Link
                href="/login?redirect=checkout"
                className="text-ink font-medium border-b border-ink"
              >
                Sign in
              </Link>{' '}
              for faster checkout.
            </span>
          </div>
          <div className="text-xs text-muted-light">No account needed</div>
        </motion.div>
      )}

      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-16">
        <form onSubmit={placeOrder}>
          {/* Contact */}
          <section className="mb-12">
            <h3 className="text-2xl font-display mb-6 pb-4 border-b border-border flex items-baseline gap-4">
              <span className="text-xs uppercase tracking-widest text-accent">01</span>
              Contact Information
            </h3>
            <div className="space-y-6">
              <div>
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="your@email.com"
                  defaultValue={user?.email}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Phone Number</label>
                <input type="tel" name="phone" required placeholder="+92 300 0000000" className="form-input" />
              </div>
            </div>
          </section>

          {/* Shipping */}
          <section className="mb-12">
            <h3 className="text-2xl font-display mb-6 pb-4 border-b border-border flex items-baseline gap-4">
              <span className="text-xs uppercase tracking-widest text-accent">02</span>
              Shipping Address
            </h3>
            <div className="grid sm:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="form-label">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  required
                  defaultValue={user?.firstName}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  required
                  defaultValue={user?.lastName}
                  className="form-input"
                />
              </div>
            </div>
            <div className="mb-6">
              <label className="form-label">Street Address</label>
              <input
                type="text"
                name="street"
                required
                placeholder="House #, Street, Area"
                className="form-input"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="form-label">City</label>
                <input type="text" name="city" required className="form-input" />
              </div>
              <div>
                <label className="form-label">Postal Code</label>
                <input type="text" name="postal" className="form-input" />
              </div>
            </div>
            <div>
              <label className="form-label">Country</label>
              <input
                type="text"
                name="country"
                defaultValue="Pakistan"
                required
                className="form-input"
              />
            </div>
          </section>

          {/* Payment */}
          <section className="mb-12">
            <h3 className="text-2xl font-display mb-6 pb-4 border-b border-border flex items-baseline gap-4">
              <span className="text-xs uppercase tracking-widest text-accent">03</span>
              Payment Method
            </h3>
            <div className="space-y-3">
              {PAYMENT_METHODS.map(({ id, label, description, Icon }) => (
                <label
                  key={id}
                  className={cn(
                    'border p-5 cursor-pointer flex items-center gap-4 transition-all',
                    payment === id
                      ? 'border-accent bg-accent/5'
                      : 'border-border hover:border-accent/50'
                  )}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={payment === id}
                    onChange={() => setPayment(id)}
                    className="accent-accent w-4 h-4"
                  />
                  <Icon size={24} className="text-ink" />
                  <div>
                    <div className="font-medium">{label}</div>
                    <div className="text-sm text-muted">{description}</div>
                  </div>
                </label>
              ))}
            </div>
          </section>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary w-full py-5 text-sm disabled:opacity-60"
          >
            {submitting ? 'Placing Order...' : 'Place Order'}
          </button>
        </form>

        {/* Order summary */}
        <aside className="bg-cream-200 p-10 sticky top-32 self-start">
          <h3 className="text-2xl font-display mb-6 pb-6 border-b border-border">Your Order</h3>
          <div className="space-y-4 mb-6">
            {cart.items.map((item) => (
              <div key={item.id} className="grid grid-cols-[60px_1fr_auto] gap-4 items-center">
                <div className="relative">
                  <div className="aspect-square overflow-hidden">
                    <ProductPlaceholder
                      productId={item.product.id}
                      productName={item.product.name}
                      category={item.product.category.name}
                      gradient={item.product.gradient}
                    />
                  </div>
                  <span className="absolute -top-2 -right-2 bg-ink text-cream text-[10px] w-[22px] h-[22px] rounded-full flex items-center justify-center">
                    {item.quantity}
                  </span>
                </div>
                <div>
                  <h5 className="font-display">{item.product.name}</h5>
                  <p className="text-xs text-muted">
                    {item.product.category.name} · {item.size}
                  </p>
                </div>
                <div className="font-medium text-sm">
                  {formatPrice(item.product.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-6 mt-6 border-t border-border space-y-3 text-sm">
            <div className="flex justify-between text-muted">
              <span>Subtotal</span>
              <span>{formatPrice(cart.totals.subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted">
              <span>Shipping</span>
              <span>
                {cart.totals.shipping === 0
                  ? 'Complimentary'
                  : formatPrice(cart.totals.shipping)}
              </span>
            </div>
            <div className="flex justify-between text-muted">
              <span>Tax (5%)</span>
              <span>{formatPrice(cart.totals.tax)}</span>
            </div>
            <div className="flex justify-between pt-4 mt-4 border-t border-border font-display text-xl">
              <span>Total</span>
              <span>{formatPrice(cart.totals.total)}</span>
            </div>
          </div>

          <div className="mt-6 p-4 bg-accent/10 flex gap-3 items-start">
            <Lock size={18} className="text-accent shrink-0 mt-0.5" />
            <p className="text-xs text-muted leading-relaxed">
              Your payment is encrypted with bank-level security. We never store your card details.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

// ============================================
// POST-ORDER SUCCESS VIEW
// Shows confirmation + (for guests) optional account creation
// ============================================
function OrderSuccess({
  orderNumber,
  email,
  isGuest,
}: {
  orderNumber: string;
  email: string;
  isGuest: boolean;
}) {
  const router = useRouter();
  const { showToast, setUser } = useStore();
  const [creating, setCreating] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  async function handleCreateAccount(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCreating(true);
    const fd = new FormData(e.currentTarget);
    const password = String(fd.get('password'));

    if (password.length < 8) {
      showToast('Password must be at least 8 characters');
      setCreating(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/quick-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, orderNumber }),
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.data.user);
        showToast(`Account created — ${data.data.linkedOrders} orders linked.`);
        setTimeout(() => router.push('/'), 1000);
      } else {
        showToast(data.message || 'Could not create account');
        setCreating(false);
      }
    } catch {
      showToast('Could not create account');
      setCreating(false);
    }
  }

  return (
    <div className="container-padded py-20 max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        {/* Success seal */}
        <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-accent/10 flex items-center justify-center">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>

        <div className="eyebrow mb-4">Order Confirmed</div>
        <h1 className="text-display-lg mb-4">
          Thank You for Your <em className="text-accent italic font-normal">Order</em>
        </h1>
        <p className="text-muted text-lg mb-2">
          Order <strong className="text-ink">{orderNumber}</strong>
        </p>
        <p className="text-muted mb-10">
          A confirmation email has been sent to <strong className="text-ink">{email}</strong>
        </p>
      </motion.div>

      {/* Account creation upsell — only for guests */}
      <AnimatePresence>
        {isGuest && !dismissed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="bg-gradient-to-br from-cream-200 to-cream border border-border p-10"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                <UserPlus size={20} />
              </div>
              <div>
                <h3 className="font-display text-2xl">Save your details for next time</h3>
                <p className="text-sm text-muted">
                  One password — track this order, save addresses, get AI picks.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateAccount} className="mt-6 space-y-4">
              <div>
                <label className="form-label">Email</label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="form-input opacity-60 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="form-label">Create Password</label>
                <input
                  type="password"
                  name="password"
                  required
                  minLength={8}
                  placeholder="At least 8 characters"
                  className="form-input"
                  autoFocus
                />
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="submit"
                  disabled={creating}
                  className="btn btn-primary flex-1 disabled:opacity-60"
                >
                  {creating ? 'Creating…' : 'Create Account'}
                </button>
                <button
                  type="button"
                  onClick={() => setDismissed(true)}
                  className="btn btn-secondary"
                >
                  No Thanks
                </button>
              </div>
              <p className="text-xs text-muted-light text-center pt-2">
                Your order is already placed. This step is optional.
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Continue shopping CTA */}
      <div className="text-center mt-12">
        <Link href="/shop" className="btn btn-secondary">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
