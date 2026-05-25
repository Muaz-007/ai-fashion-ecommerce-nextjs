import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { calculateTotals } from '@/lib/utils';
import { trackActivity } from '@/lib/recommendations';

// GET — fetch cart (or count only if ?count=true)
export async function GET(req: NextRequest) {
  const session = await getSession();
  const countOnly = req.nextUrl.searchParams.get('count') === 'true';

  if (!session) {
    return NextResponse.json({
      success: true,
      data: countOnly ? { count: 0 } : { items: [], count: 0, totals: calculateTotals(0) },
    });
  }

  if (countOnly) {
    const agg = await prisma.cartItem.aggregate({
      where: { userId: session.userId },
      _sum: { quantity: true },
    });
    return NextResponse.json({
      success: true,
      data: { count: agg._sum.quantity ?? 0 },
    });
  }

  const items = await prisma.cartItem.findMany({
    where: { userId: session.userId },
    include: { product: { include: { category: true } } },
    orderBy: { addedAt: 'desc' },
  });

  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const totalQty = items.reduce((sum, i) => sum + i.quantity, 0);

  return NextResponse.json({
    success: true,
    data: {
      items,
      count: totalQty,
      totals: calculateTotals(subtotal),
    },
  });
}

// POST — add item to cart
const AddSchema = z.object({
  productId: z.number().int().positive(),
  size: z.string().min(1),
  quantity: z.number().int().positive().default(1),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { success: false, message: 'Sign in to add items to your bag' },
      { status: 401 }
    );
  }

  try {
    const data = AddSchema.parse(await req.json());

    const product = await prisma.product.findUnique({ where: { id: data.productId } });
    if (!product || !product.isActive) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    await prisma.cartItem.upsert({
      where: {
        userId_productId_size: {
          userId: session.userId,
          productId: data.productId,
          size: data.size,
        },
      },
      update: { quantity: { increment: data.quantity } },
      create: {
        userId: session.userId,
        productId: data.productId,
        size: data.size,
        quantity: data.quantity,
      },
    });

    await trackActivity(data.productId, 'cart_add', session.userId, null);

    return NextResponse.json({ success: true, message: 'Added to your bag' });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: 'Invalid input' }, { status: 422 });
    }
    return NextResponse.json({ success: false, message: 'Failed to add' }, { status: 500 });
  }
}

// PATCH — update item quantity
const UpdateSchema = z.object({
  cartId: z.number().int().positive(),
  quantity: z.number().int().min(0),
});

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { cartId, quantity } = UpdateSchema.parse(await req.json());

    const item = await prisma.cartItem.findFirst({
      where: { id: cartId, userId: session.userId },
    });
    if (!item) {
      return NextResponse.json({ success: false, message: 'Cart item not found' }, { status: 404 });
    }

    if (quantity === 0) {
      await prisma.cartItem.delete({ where: { id: cartId } });
      return NextResponse.json({ success: true, message: 'Item removed' });
    }

    await prisma.cartItem.update({ where: { id: cartId }, data: { quantity } });
    return NextResponse.json({ success: true, message: 'Quantity updated' });
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid input' }, { status: 422 });
  }
}

// DELETE — remove a cart item by id (?id=)
export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const id = Number(req.nextUrl.searchParams.get('id'));
  if (!id) {
    return NextResponse.json({ success: false, message: 'id required' }, { status: 422 });
  }

  await prisma.cartItem.deleteMany({ where: { id, userId: session.userId } });
  return NextResponse.json({ success: true, message: 'Removed from your bag' });
}
