// ============================================
// Shared TypeScript types
// ============================================

import type { Prisma } from '@prisma/client';

export type ProductWithRelations = Prisma.ProductGetPayload<{
  include: {
    category: true;
    sizes: true;
    colors: true;
    badges: true;
    tags: true;
  };
}>;

export type CartItemWithProduct = Prisma.CartItemGetPayload<{
  include: { product: { include: { category: true } } };
}>;

export type OrderWithItems = Prisma.OrderGetPayload<{
  include: { items: { include: { product: true } }; user: true };
}>;

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}
