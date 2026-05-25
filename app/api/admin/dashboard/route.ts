import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
  }

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

  const [
    totalRevenue,
    totalOrders,
    newCustomers,
    totalProducts,
    pendingOrders,
    currentMonth,
    previousMonth,
    views,
    purchases,
  ] = await Promise.all([
    prisma.order.aggregate({ where: { paymentStatus: 'paid' }, _sum: { total: true } }),
    prisma.order.count(),
    prisma.user.count({ where: { role: 'customer', createdAt: { gte: thirtyDaysAgo } } }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.order.count({ where: { status: { in: ['pending', 'processing'] } } }),
    prisma.order.aggregate({
      where: { paymentStatus: 'paid', createdAt: { gte: thirtyDaysAgo } },
      _sum: { total: true },
    }),
    prisma.order.aggregate({
      where: {
        paymentStatus: 'paid',
        createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
      },
      _sum: { total: true },
    }),
    prisma.userActivity.count({ where: { activityType: 'view' } }),
    prisma.userActivity.count({ where: { activityType: 'purchase' } }),
  ]);

  const current = currentMonth._sum.total ?? 0;
  const previous = previousMonth._sum.total ?? 0;
  const revenueChange =
    previous > 0 ? Math.round(((current - previous) / previous) * 1000) / 10 : 0;

  const conversionRate = views > 0 ? Math.round((purchases / views) * 1000) / 10 : 0;

  return NextResponse.json({
    success: true,
    data: {
      totalRevenue: totalRevenue._sum.total ?? 0,
      totalOrders,
      newCustomers,
      totalProducts,
      pendingOrders,
      revenueChange,
      aiConversionRate: conversionRate,
    },
  });
}
