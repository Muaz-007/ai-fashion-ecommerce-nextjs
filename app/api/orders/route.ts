import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { calculateTotals, generateOrderNumber } from '@/lib/utils';
import { trackActivity } from '@/lib/recommendations';

const GuestItemSchema = z.object({
  productId: z.number().int().positive(),
  size: z.string().min(1),
  quantity: z.number().int().positive(),
});

const PlaceOrderSchema = z.object({
  shippingFirstName: z.string().min(1),
  shippingLastName: z.string().min(1),
  shippingEmail: z.string().email(),
  shippingPhone: z.string().min(1),
  shippingStreet: z.string().min(1),
  shippingCity: z.string().min(1),
  shippingPostalCode: z.string().optional(),
  shippingCountry: z.string().default('Pakistan'),
  paymentMethod: z.enum(['card', 'jazzcash', 'easypaisa', 'bank_transfer', 'cod']),
  notes: z.string().optional(),
  /** Guest orders include cart items in the request body */
  items: z.array(GuestItemSchema).optional(),
});

// GET — list user's orders
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.userId },
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ success: true, data: { orders } });
}

// POST — place a new order (logged-in OR guest)
export async function POST(req: NextRequest) {
  const session = await getSession();
  let data: z.infer<typeof PlaceOrderSchema>;
  try {
    data = PlaceOrderSchema.parse(await req.json());
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Please complete all required fields', errors: e.errors },
        { status: 422 }
      );
    }
    return NextResponse.json({ success: false, message: 'Invalid input' }, { status: 422 });
  }

  // ------------ Build the cart items list ------------
  let cartItems: Array<{
    productId: number;
    size: string;
    quantity: number;
    product: { id: number; name: string; price: number };
  }> = [];

  if (session) {
    // Logged-in: pull from server cart
    const serverItems = await prisma.cartItem.findMany({
      where: { userId: session.userId },
      include: { product: true },
    });
    cartItems = serverItems.map((c) => ({
      productId: c.productId,
      size: c.size,
      quantity: c.quantity,
      product: c.product,
    }));
  } else {
    // Guest: items must be passed in the request body
    if (!data.items || data.items.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Your bag is empty' },
        { status: 422 }
      );
    }
    const productIds = [...new Set(data.items.map((i) => i.productId))];
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    for (const item of data.items) {
      const product = productMap.get(item.productId);
      if (!product) continue;
      cartItems.push({
        productId: item.productId,
        size: item.size,
        quantity: item.quantity,
        product,
      });
    }
  }

  if (cartItems.length === 0) {
    return NextResponse.json(
      { success: false, message: 'Your bag is empty' },
      { status: 422 }
    );
  }

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const totals = calculateTotals(subtotal);
  const orderNumber = generateOrderNumber();

  try {
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: session?.userId ?? null,
          subtotal: totals.subtotal,
          shippingCost: totals.shipping,
          tax: totals.tax,
          total: totals.total,
          status: 'pending',
          paymentMethod: data.paymentMethod,
          paymentStatus: data.paymentMethod === 'cod' ? 'pending' : 'paid',
          shippingFirstName: data.shippingFirstName,
          shippingLastName: data.shippingLastName,
          shippingEmail: data.shippingEmail,
          shippingPhone: data.shippingPhone,
          shippingStreet: data.shippingStreet,
          shippingCity: data.shippingCity,
          shippingPostalCode: data.shippingPostalCode,
          shippingCountry: data.shippingCountry,
          notes: data.notes,
        },
      });

      for (const item of cartItems) {
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: item.productId,
            productName: item.product.name,
            size: item.size,
            quantity: item.quantity,
            unitPrice: item.product.price,
            subtotal: item.product.price * item.quantity,
          },
        });

        await tx.product.update({
          where: { id: item.productId },
          data: { stockQuantity: { decrement: item.quantity } },
        });
      }

      // Clear server cart for logged-in users
      if (session) {
        await tx.cartItem.deleteMany({ where: { userId: session.userId } });
      }

      return newOrder;
    });

    // Track purchase activity
    for (const item of cartItems) {
      await trackActivity(item.productId, 'purchase', session?.userId ?? null, null);
    }

    return NextResponse.json({
      success: true,
      message: 'Order placed successfully',
      data: {
        order,
        orderNumber: order.orderNumber,
        isGuest: !session,
        email: data.shippingEmail,
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { success: false, message: 'Order failed. Please try again.' },
      { status: 500 }
    );
  }
}
