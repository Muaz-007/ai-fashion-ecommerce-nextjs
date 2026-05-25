// ============================================
// POST /api/auth/quick-register
// Post-purchase one-tap account creation.
// Takes email + password (everything else comes from the recent order).
// Links any past guest orders with the same email to the new account.
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { hashPassword, createSession } from '@/lib/auth';

const Schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  orderNumber: z.string().min(1).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const data = Schema.parse(await req.json());

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: 'An account with this email already exists. Sign in instead.',
        },
        { status: 409 }
      );
    }

    // Pull name + phone from a recent guest order with this email (best-effort)
    const recentOrder = await prisma.order.findFirst({
      where: {
        shippingEmail: data.email,
        userId: null,
        ...(data.orderNumber ? { orderNumber: data.orderNumber } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });

    const user = await prisma.user.create({
      data: {
        firstName: recentOrder?.shippingFirstName ?? 'Valued',
        lastName: recentOrder?.shippingLastName ?? 'Customer',
        email: data.email,
        phone: recentOrder?.shippingPhone ?? null,
        passwordHash: await hashPassword(data.password),
        role: 'customer',
      },
    });

    // Link all past guest orders with this email to the new account
    const linked = await prisma.order.updateMany({
      where: { shippingEmail: data.email, userId: null },
      data: { userId: user.id },
    });

    await createSession({
      userId: user.id,
      email: user.email,
      role: 'customer',
      firstName: user.firstName,
    });

    return NextResponse.json({
      success: true,
      message: 'Account created — your orders are now linked.',
      data: {
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
        },
        linkedOrders: linked.count,
      },
    });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Invalid input', errors: e.errors },
        { status: 422 }
      );
    }
    return NextResponse.json(
      { success: false, message: 'Could not create account' },
      { status: 500 }
    );
  }
}
