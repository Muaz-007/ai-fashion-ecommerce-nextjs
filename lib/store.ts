// ============================================
// Zustand store for client-side state
// Tracks auth state + cart count for header sync
// ============================================

import { create } from 'zustand';
import { localCartCount } from './cart';

interface CurrentUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: 'customer' | 'admin';
}

interface AppState {
  user: CurrentUser | null;
  cartCount: number;
  toast: { message: string; id: number } | null;

  setUser: (user: CurrentUser | null) => void;
  setCartCount: (count: number) => void;
  /** Recompute cart count from localStorage (used when guest adds/removes). */
  refreshLocalCartCount: () => void;
  showToast: (message: string) => void;
  clearToast: () => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  cartCount: 0,
  toast: null,

  setUser: (user) => set({ user }),
  setCartCount: (count) => set({ cartCount: count }),
  refreshLocalCartCount: () => set({ cartCount: localCartCount() }),
  showToast: (message) =>
    set({ toast: { message, id: Date.now() } }),
  clearToast: () => set({ toast: null }),
}));
