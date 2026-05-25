// ============================================
// Unified cart layer (client-only)
//
// Auto-switches storage based on auth state:
//   - Logged out: localStorage ("guest cart")
//   - Logged in:  server (Prisma via /api/cart)
//
// On login, the guest cart is merged into the user's server cart.
// ============================================

const LS_KEY = 'maison_cart_local';

export interface LocalCartItem {
  productId: number;
  size: string;
  quantity: number;
}

/** Read the guest cart from localStorage (browser-only). */
export function readLocalCart(): LocalCartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeLocalCart(items: LocalCartItem[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LS_KEY, JSON.stringify(items));
}

export function clearLocalCart() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(LS_KEY);
}

/** Add to local cart (merges quantities for same product+size). */
export function addToLocalCart(productId: number, size: string, quantity = 1) {
  const cart = readLocalCart();
  const existing = cart.find((c) => c.productId === productId && c.size === size);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ productId, size, quantity });
  }
  writeLocalCart(cart);
  return cart;
}

export function removeFromLocalCart(productId: number, size: string) {
  const cart = readLocalCart().filter(
    (c) => !(c.productId === productId && c.size === size)
  );
  writeLocalCart(cart);
  return cart;
}

export function updateLocalCartQty(productId: number, size: string, quantity: number) {
  const cart = readLocalCart();
  const item = cart.find((c) => c.productId === productId && c.size === size);
  if (!item) return cart;
  if (quantity <= 0) return removeFromLocalCart(productId, size);
  item.quantity = quantity;
  writeLocalCart(cart);
  return cart;
}

export function localCartCount(): number {
  return readLocalCart().reduce((sum, i) => sum + i.quantity, 0);
}

/**
 * Push every local cart item to the server, then clear localStorage.
 * Called after login.
 */
export async function syncLocalCartToServer(): Promise<void> {
  const cart = readLocalCart();
  if (cart.length === 0) return;

  await Promise.all(
    cart.map((item) =>
      fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      }).catch(() => null)
    )
  );

  clearLocalCart();
}
