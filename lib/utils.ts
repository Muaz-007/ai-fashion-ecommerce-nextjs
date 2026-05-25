import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number): string {
  return 'PKR ' + amount.toLocaleString('en-PK');
}

export function generateOrderNumber(): string {
  const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  const year = new Date().getFullYear().toString().slice(-2);
  return `MA-${random}-${year}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function calculateTotals(subtotal: number) {
  const FREE_SHIPPING_THRESHOLD = 10000;
  const SHIPPING_COST = 500;
  const TAX_RATE = 0.05;

  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const tax = Math.round(subtotal * TAX_RATE);
  const total = subtotal + shipping + tax;

  return {
    subtotal: Math.round(subtotal),
    shipping,
    tax,
    total: Math.round(total),
  };
}
