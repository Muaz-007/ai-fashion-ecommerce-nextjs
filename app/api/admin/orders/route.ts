import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
  }

  const status = req.nextUrl.searchParams.get('status');
  const limit = Math.min(200, Number(req.nextUrl.searchParams.get('limit') || 50));

  const orders = await prisma.order.findMany({
    where: status ? { status } : undefined,
    include: {
      user: { select: { firstName: true, lastName: true, email: true } },
      items: true,
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return NextResponse.json({ success: true, data: { orders } });
}
