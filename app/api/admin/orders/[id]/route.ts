import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

const VALID_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] as const;
const VALID_PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'] as const;

const updateSchema = z.object({
  status: z.enum(VALID_STATUSES).optional(),
  paymentStatus: z.enum(VALID_PAYMENT_STATUSES).optional(),
  notes: z.string().max(2000).optional(),
}).refine((d) => d.status || d.paymentStatus || d.notes !== undefined, {
  message: 'At least one field must be provided',
});

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const orderId = Number(id);
  if (!Number.isInteger(orderId) || orderId <= 0) {
    return NextResponse.json({ success: false, message: 'Invalid id' }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
      items: {
        include: {
          product: { select: { id: true, name: true, slug: true, sku: true, gradient: true, imageUrl: true } },
        },
      },
    },
  });

  if (!order) {
    return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: { order } });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const orderId = Number(id);
  if (!Number.isInteger(orderId) || orderId <= 0) {
    return NextResponse.json({ success: false, message: 'Invalid id' }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: parsed.error.issues[0]?.message ?? 'Validation failed' },
      { status: 400 }
    );
  }

  const existing = await prisma.order.findUnique({ where: { id: orderId } });
  if (!existing) {
    return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
  }

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: parsed.data,
  });

  return NextResponse.json({ success: true, data: { order: updated } });
}
