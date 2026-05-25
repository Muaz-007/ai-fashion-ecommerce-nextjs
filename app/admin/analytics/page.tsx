import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/utils';
import { AdminPageHeader } from '../AdminPageHeader';
import nextDynamic from 'next/dynamic';

const AdminCharts = nextDynamic(
  () => import('../AdminCharts').then((m) => m.AdminCharts),
  {
    loading: () => (
      <div className="bg-cream p-8 border border-border h-[420px] animate-pulse">
        <div className="h-8 w-40 bg-cream-200 mb-6"></div>
        <div className="h-72 bg-cream-200/60"></div>
      </div>
    ),
  }
);

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Analytics · Admin' };

export default async function AnalyticsPage() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [
    monthsData,
    categoryRevenue,
    topProducts,
    paymentMethods,
  ] = await Promise.all([
    prisma.$queryRaw<Array<{ month: string; revenue: number }>>`
      SELECT strftime('%m', createdAt) as month, SUM(total) as revenue
      FROM 'Order'
      WHERE paymentStatus = 'paid' AND createdAt >= date('now', '-12 months')
      GROUP BY month
      ORDER BY month
    `.catch(() => []),

    prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { subtotal: true, quantity: true },
      orderBy: { _sum: { subtotal: 'desc' } },
      take: 50,
    }),

    prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true, subtotal: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    }),

    prisma.order.groupBy({
      by: ['paymentMethod'],
      _count: true,
      _sum: { total: true },
    }),
  ]);

  // Enrich top products
  const topProductIds = topProducts.map((p) => p.productId);
  const productData = await prisma.product.findMany({
    where: { id: { in: topProductIds } },
    include: { category: true },
  });
  const productMap = new Map(productData.map((p) => [p.id, p]));

  // Aggregate by category
  const categoryAgg = new Map<string, number>();
  for (const item of categoryRevenue) {
    const product = await prisma.product.findUnique({
      where: { id: item.productId },
      include: { category: true },
    });
    if (product) {
      const current = categoryAgg.get(product.category.name) ?? 0;
      categoryAgg.set(product.category.name, current + (item._sum.subtotal ?? 0));
    }
  }
  const categoryStats = [...categoryAgg.entries()]
    .map(([name, revenue]) => ({ name, revenue }))
    .sort((a, b) => b.revenue - a.revenue);
  const totalCategoryRevenue = categoryStats.reduce((sum, c) => sum + c.revenue, 0);

  // Activity counts for conversion funnel
  const [views, cartAdds, purchases] = await Promise.all([
    prisma.userActivity.count({ where: { activityType: 'view' } }),
    prisma.userActivity.count({ where: { activityType: 'cart_add' } }),
    prisma.userActivity.count({ where: { activityType: 'purchase' } }),
  ]);

  const viewToCart = views > 0 ? (cartAdds / views) * 100 : 0;
  const cartToPurchase = cartAdds > 0 ? (purchases / cartAdds) * 100 : 0;
  const overall = views > 0 ? (purchases / views) * 100 : 0;

  const totalPayments = paymentMethods.reduce((sum, p) => sum + p._count, 0);

  return (
    <div>
      <AdminPageHeader
        eyebrow="Performance"
        title="Analytics"
        subtitle="Deep-dive into revenue, conversion, and product performance"
      />

      <AdminCharts monthsData={monthsData} />

      {/* Conversion funnel */}
      <div className="bg-cream border border-border p-8 mt-8">
        <h3 className="font-display text-2xl mb-6 pb-5 border-b border-border">
          Conversion Funnel
        </h3>
        <div className="space-y-5">
          <FunnelStep
            label="Product Views"
            value={views}
            percent={100}
            color="#B08D5A"
          />
          <FunnelStep
            label="Added to Cart"
            value={cartAdds}
            percent={viewToCart}
            color="#8B6F47"
            conversionLabel={`${viewToCart.toFixed(1)}% of views`}
          />
          <FunnelStep
            label="Completed Purchase"
            value={purchases}
            percent={overall}
            color="#5A7A5A"
            conversionLabel={`${cartToPurchase.toFixed(1)}% of carts · ${overall.toFixed(1)}% overall`}
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mt-8">
        {/* Category revenue */}
        <div className="bg-cream border border-border p-8">
          <h3 className="font-display text-2xl mb-6 pb-5 border-b border-border">
            Revenue by Category
          </h3>
          {categoryStats.length === 0 ? (
            <p className="text-muted text-sm">No order data yet.</p>
          ) : (
            <div className="space-y-4">
              {categoryStats.map((cat) => {
                const pct =
                  totalCategoryRevenue > 0
                    ? (cat.revenue / totalCategoryRevenue) * 100
                    : 0;
                return (
                  <div key={cat.name}>
                    <div className="flex justify-between mb-1.5 text-sm">
                      <span className="font-medium">{cat.name}</span>
                      <span className="text-muted">{formatPrice(cat.revenue)}</span>
                    </div>
                    <div className="h-2 bg-cream-200 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-accent-300 to-accent transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Payment methods */}
        <div className="bg-cream border border-border p-8">
          <h3 className="font-display text-2xl mb-6 pb-5 border-b border-border">
            Payment Methods
          </h3>
          {paymentMethods.length === 0 ? (
            <p className="text-muted text-sm">No order data yet.</p>
          ) : (
            <div className="space-y-4">
              {paymentMethods.map((p) => {
                const pct = totalPayments > 0 ? (p._count / totalPayments) * 100 : 0;
                return (
                  <div key={p.paymentMethod}>
                    <div className="flex justify-between mb-1.5 text-sm">
                      <span className="font-medium capitalize">
                        {p.paymentMethod.replace('_', ' ')}
                      </span>
                      <span className="text-muted">
                        {p._count} orders · {formatPrice(p._sum.total ?? 0)}
                      </span>
                    </div>
                    <div className="h-2 bg-cream-200 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-accent-300 to-accent transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Top products */}
      <div className="bg-cream border border-border mt-8">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="font-display text-2xl">Top 5 Products</h3>
          <p className="text-xs text-muted mt-1">Sorted by units sold</p>
        </div>
        <div className="divide-y divide-border">
          {topProducts.length === 0 ? (
            <p className="p-8 text-muted text-sm text-center">No sales data yet.</p>
          ) : (
            topProducts.map((item, i) => {
              const product = productMap.get(item.productId);
              if (!product) return null;
              return (
                <div
                  key={item.productId}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-cream-200/50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-accent text-cream flex items-center justify-center text-sm font-semibold shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{product.name}</div>
                    <div className="text-xs text-muted">{product.category.name}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-medium">{item._sum.quantity ?? 0} units</div>
                    <div className="text-xs text-muted">
                      {formatPrice(item._sum.subtotal ?? 0)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function FunnelStep({
  label,
  value,
  percent,
  color,
  conversionLabel,
}: {
  label: string;
  value: number;
  percent: number;
  color: string;
  conversionLabel?: string;
}) {
  return (
    <div>
      <div className="flex justify-between items-baseline mb-2">
        <div>
          <span className="font-medium">{label}</span>
          {conversionLabel && (
            <span className="text-xs text-muted ml-3">{conversionLabel}</span>
          )}
        </div>
        <span className="font-display text-xl">{value.toLocaleString()}</span>
      </div>
      <div className="h-3 bg-cream-200 overflow-hidden">
        <div
          className="h-full transition-all"
          style={{ width: `${Math.max(percent, 1)}%`, background: color }}
        />
      </div>
    </div>
  );
}
