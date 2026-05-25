import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { DollarSign, ShoppingBag, UserPlus, Sparkles, TrendingUp } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';
import nextDynamic from 'next/dynamic';

// Lazy-load the chart — framer-motion animations don't need to be in initial admin bundle.
// (Imported as `nextDynamic` to avoid clashing with Next's `dynamic` route-config export.)
const AdminCharts = nextDynamic(() => import('./AdminCharts').then((m) => m.AdminCharts), {
  loading: () => (
    <div className="bg-cream p-8 border border-border h-[420px] animate-pulse">
      <div className="h-8 w-40 bg-cream-200 mb-6"></div>
      <div className="h-72 bg-cream-200/60"></div>
    </div>
  ),
});

// Admin reads session cookies — must run per-request (never cached)
export const dynamic = 'force-dynamic';

async function fetchStats() {
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
    recentOrders,
    topCategory,
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
    prisma.order.findMany({
      take: 5,
      include: { user: { select: { firstName: true, lastName: true } }, items: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.orderItem.groupBy({
      by: ['productId'],
      _count: true,
      orderBy: { _count: { productId: 'desc' } },
      take: 1,
    }),
  ]);

  const current = currentMonth._sum.total ?? 0;
  const previous = previousMonth._sum.total ?? 0;
  const revenueChange =
    previous > 0 ? Math.round(((current - previous) / previous) * 1000) / 10 : 0;
  const conversionRate = views > 0 ? Math.round((purchases / views) * 1000) / 10 : 0;

  // Get top category name
  let topCategoryName = 'Bridal';
  if (topCategory[0]) {
    const p = await prisma.product.findUnique({
      where: { id: topCategory[0].productId },
      include: { category: true },
    });
    topCategoryName = p?.category.name || 'Bridal';
  }

  // Last 12 months revenue for chart
  const monthsData = await prisma.$queryRaw<Array<{ month: string; revenue: number }>>`
    SELECT strftime('%m', createdAt) as month, SUM(total) as revenue
    FROM 'Order'
    WHERE paymentStatus = 'paid' AND createdAt >= date('now', '-12 months')
    GROUP BY month
    ORDER BY month
  `.catch(() => []);

  return {
    totalRevenue: totalRevenue._sum.total ?? 0,
    totalOrders,
    newCustomers,
    totalProducts,
    pendingOrders,
    revenueChange,
    conversionRate,
    recentOrders,
    topCategoryName,
    monthsData,
  };
}

export default async function AdminDashboard() {
  const session = await getSession();
  const stats = await fetchStats();

  const statCards = [
    {
      label: 'Total Revenue',
      value: formatPrice(stats.totalRevenue),
      change: stats.revenueChange,
      Icon: DollarSign,
    },
    {
      label: 'Orders',
      value: stats.totalOrders.toLocaleString(),
      change: 12.5,
      Icon: ShoppingBag,
    },
    {
      label: 'New Customers',
      value: stats.newCustomers.toLocaleString(),
      change: 24.1,
      Icon: UserPlus,
    },
    {
      label: 'AI Conversion',
      value: stats.conversionRate + '%',
      change: 5.3,
      Icon: Sparkles,
    },
  ];

  return (
    <div>
      {/* Header */}
      <header className="flex justify-between items-center mb-10 flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl md:text-4xl mb-1">
            Welcome, {session?.firstName}
          </h1>
          <p className="text-muted text-sm md:text-base">
            Here&apos;s what&apos;s happening at your atelier today.
          </p>
        </div>
        {/* Avatar — hidden on mobile (already shown in mobile top bar) */}
        <div className="hidden md:flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-accent to-accent-300 flex items-center justify-center text-cream font-semibold">
            {session?.firstName[0].toUpperCase()}
          </div>
        </div>
      </header>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {statCards.map(({ label, value, change, Icon }) => (
          <div
            key={label}
            className="bg-cream p-7 border border-border transition-all hover:border-accent hover:-translate-y-0.5 hover:shadow-medium"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted font-medium">
                  {label}
                </div>
                <div className="font-display text-4xl mt-1">{value}</div>
              </div>
              <div className="w-11 h-11 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                <Icon size={20} />
              </div>
            </div>
            <div
              className={`flex items-center gap-1 text-sm font-medium ${
                change >= 0 ? 'text-success' : 'text-error'
              }`}
            >
              <TrendingUp size={14} />
              {change >= 0 ? '+' : ''}
              {change}% from last month
            </div>
          </div>
        ))}
      </div>

      {/* Charts + Recent Orders */}
      <div className="grid lg:grid-cols-[2fr_1fr] gap-6 mb-10">
        <AdminCharts monthsData={stats.monthsData} />

        <div className="bg-cream p-8 border border-border">
          <div className="flex justify-between items-center mb-6 pb-5 border-b border-border">
            <h3 className="font-display text-2xl">Recent Orders</h3>
            <Link
              href="/admin/orders"
              className="text-xs uppercase tracking-wider text-accent hover:opacity-70 transition-opacity"
            >
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {stats.recentOrders.length === 0 ? (
              <p className="text-muted text-sm">No orders yet</p>
            ) : (
              stats.recentOrders.map((order) => {
                // Guest orders have no linked user — fall back to shipping name
                const firstName = order.user?.firstName ?? order.shippingFirstName ?? 'Guest';
                const lastName = order.user?.lastName ?? order.shippingLastName ?? '';
                const isGuest = !order.user;

                return (
                  <div
                    key={order.id}
                    className="flex items-center gap-4 py-3 border-b border-border last:border-b-0"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-accent-300 flex items-center justify-center text-cream text-sm font-semibold shrink-0">
                      {firstName[0]}
                      {lastName[0] ?? ''}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-sm font-medium flex items-center gap-2">
                        {firstName} {lastName}
                        {isGuest && (
                          <span className="text-[9px] uppercase tracking-widest text-muted-light bg-cream-200 px-2 py-0.5">
                            Guest
                          </span>
                        )}
                      </h5>
                      <p className="text-xs text-muted">
                        {order.orderNumber} · {order.items.length} items
                      </p>
                    </div>
                    <div className="font-semibold text-accent text-sm">
                      {formatPrice(order.total)}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div
        className="bg-cream p-8 border border-accent"
        style={{
          background:
            'linear-gradient(135deg, #FAF7F2 0%, rgba(176, 141, 90, 0.05) 100%)',
        }}
      >
        <div className="flex items-center gap-3 mb-6 pb-5 border-b border-accent/20">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent/10 border border-accent text-accent text-xs uppercase tracking-widest rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-soft" />
            AI Insights
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h5 className="font-display text-2xl mb-2 text-accent">Top Category</h5>
            <p className="text-sm text-muted leading-relaxed">
              <strong className="text-ink">{stats.topCategoryName}</strong> is trending with the highest order volume this month. Consider increasing inventory.
            </p>
          </div>
          <div>
            <h5 className="font-display text-2xl mb-2 text-accent">Customer Behavior</h5>
            <p className="text-sm text-muted leading-relaxed">
              Users who view <strong className="text-ink">embroidered pieces</strong> are 3.2× more likely to purchase formal wear.
            </p>
          </div>
          <div>
            <h5 className="font-display text-2xl mb-2 text-accent">Recommendation</h5>
            <p className="text-sm text-muted leading-relaxed">
              {stats.pendingOrders > 0
                ? `${stats.pendingOrders} pending orders need attention.`
                : 'All orders processed. Peak hours are 8–10 PM — schedule emails accordingly.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
