import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const category = sp.get('category');
  const color = sp.get('color');
  const minPrice = sp.get('minPrice') ? Number(sp.get('minPrice')) : null;
  const maxPrice = sp.get('maxPrice') ? Number(sp.get('maxPrice')) : null;
  const sort = sp.get('sort') || 'featured';
  const limit = Math.min(100, Number(sp.get('limit') || 50));
  const search = sp.get('search');

  const where: import('@prisma/client').Prisma.ProductWhereInput = { isActive: true };

  if (category && category !== 'All') {
    where.category = { name: category };
  }
  if (color) {
    where.colors = { some: { colorHex: color } };
  }
  if (minPrice !== null || maxPrice !== null) {
    where.price = {};
    if (minPrice !== null) where.price.gte = minPrice;
    if (maxPrice !== null) where.price.lte = maxPrice;
  }
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
      { tags: { some: { tag: { contains: search } } } },
    ];
  }

  const orderBy: import('@prisma/client').Prisma.ProductOrderByWithRelationInput =
    sort === 'price-low'
      ? { price: 'asc' }
      : sort === 'price-high'
      ? { price: 'desc' }
      : sort === 'rating'
      ? { rating: 'desc' }
      : sort === 'newest'
      ? { createdAt: 'desc' }
      : { isFeatured: 'desc' };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: true,
        sizes: true,
        colors: true,
        badges: true,
        tags: true,
      },
      orderBy,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return NextResponse.json({
    success: true,
    data: { products, total },
  });
}
