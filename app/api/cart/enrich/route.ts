// ============================================
// POST /api/cart/enrich
// Given a list of {productId, size, quantity}, returns full product details.
// Used by the cart page to render the guest cart (which only stores IDs).
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { calculateTotals } from '@/lib/utils';

const Schema = z.object({
  items: z.array(
    z.object({
      productId: z.number().int().positive(),
      size: z.string().min(1),
      quantity: z.number().int().positive(),
    })
  ),
});

export async function POST(req: NextRequest) {
  try {
    const { items } = Schema.parse(await req.json());

    if (items.length === 0) {
      return NextResponse.json({
        success: true,
        data: { items: [], count: 0, totals: calculateTotals(0) },
      });
    }

    const productIds = [...new Set(items.map((i) => i.productId))];
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
      include: { category: true },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    const enriched = items
      .map((item) => {
        const product = productMap.get(item.productId);
        if (!product) return null;
        return {
          // Synthetic id (guest cart has no DB row)
          id: `${item.productId}-${item.size}`,
          productId: item.productId,
          size: item.size,
          quantity: item.quantity,
          line_total: product.price * item.quantity,
          product,
        };
      })
      .filter(Boolean);

    const subtotal = enriched.reduce(
      (sum, e) => sum + (e?.line_total ?? 0),
      0
    );
    const totalQty = enriched.reduce((sum, e) => sum + (e?.quantity ?? 0), 0);

    return NextResponse.json({
      success: true,
      data: {
        items: enriched,
        count: totalQty,
        totals: calculateTotals(subtotal),
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Invalid request' },
      { status: 422 }
    );
  }
}
