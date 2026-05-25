import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { trackActivity } from '@/lib/recommendations';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ success: true, data: { items: [], count: 0 } });
  }

  const items = await prisma.wishlistItem.findMany({
    where: { userId: session.userId },
    include: { product: { include: { category: true, badges: true } } },
    orderBy: { addedAt: 'desc' },
  });

  return NextResponse.json({
    success: true,
    data: { items, count: items.length },
  });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { success: false, message: 'Sign in to save items' },
      { status: 401 }
    );
  }

  const { productId } = await req.json();
  if (!productId) {
    return NextResponse.json({ success: false, message: 'productId required' }, { status: 422 });
  }

  const existing = await prisma.wishlistItem.findUnique({
    where: { userId_productId: { userId: session.userId, productId } },
  });

  if (existing) {
    await prisma.wishlistItem.delete({ where: { id: existing.id } });
    return NextResponse.json({
      success: true,
      message: 'Removed from wishlist',
      data: { added: false },
    });
  }

  await prisma.wishlistItem.create({
    data: { userId: session.userId, productId },
  });

  await trackActivity(productId, 'wishlist_add', session.userId, null);

  return NextResponse.json({
    success: true,
    message: 'Added to wishlist',
    data: { added: true },
  });
}
