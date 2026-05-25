import { prisma } from '@/lib/prisma';
import { AdminPageHeader } from '../AdminPageHeader';
import { Lightbulb, Clock, TrendingUp, MapPin } from 'lucide-react';
import { formatPrice, cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Customer Insights · Admin' };

interface SegmentData {
  name: 'VIP' | 'Loyal' | 'Active' | 'New';
  count: number;
  color: string;
  description: string;
}

function classifySegment(orders: number, ltv: number): SegmentData['name'] {
  if (ltv >= 100000 && orders >= 5) return 'VIP';
  if (orders >= 3) return 'Loyal';
  if (orders >= 1) return 'Active';
  return 'New';
}

export default async function InsightsPage() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  // Customer segmentation
  const users = await prisma.user.findMany({
    where: { role: 'customer' },
    include: {
      orders: { where: { paymentStatus: 'paid' }, select: { total: true } },
    },
  });

  const segmentCounts = { VIP: 0, Loyal: 0, Active: 0, New: 0 };
  for (const u of users) {
    const orders = u.orders.length;
    const ltv = u.orders.reduce((sum, o) => sum + o.total, 0);
    segmentCounts[classifySegment(orders, ltv)]++;
  }

  const segments: SegmentData[] = [
    { name: 'VIP', count: segmentCounts.VIP, color: '#B08D5A', description: 'High-value loyalty' },
    { name: 'Loyal', count: segmentCounts.Loyal, color: '#5A7A5A', description: 'Repeat buyers' },
    { name: 'Active', count: segmentCounts.Active, color: '#6B5D4F', description: 'Recent buyers' },
    { name: 'New', count: segmentCounts.New, color: '#C9B398', description: 'Yet to purchase' },
  ];
  const totalCustomers = users.length;

  // Peak shopping hours
  const peakData = await prisma.$queryRaw<Array<{ hour: number; count: number }>>`
    SELECT CAST(strftime('%H', createdAt) AS INTEGER) as hour, COUNT(*) as count
    FROM 'Order'
    WHERE createdAt >= date('now', '-30 days')
    GROUP BY hour
    ORDER BY hour
  `.catch(() => []);

  const hourlyMap = new Map(peakData.map((d) => [d.hour, Number(d.count)]));
  const hourlyChart = Array.from({ length: 24 }, (_, h) => ({
    hour: h,
    count: hourlyMap.get(h) ?? 0,
  }));
  const maxHourCount = Math.max(...hourlyChart.map((h) => h.count), 1);
  const peakHour = hourlyChart.reduce((max, h) => (h.count > max.count ? h : max), {
    hour: 0,
    count: 0,
  });

  // Top categories by units sold
  const categoryAgg = new Map<string, { units: number; revenue: number }>();
  const orderItems = await prisma.orderItem.findMany({
    where: { order: { createdAt: { gte: thirtyDaysAgo } } },
    include: { product: { include: { category: true } } },
  });

  for (const item of orderItems) {
    const cat = item.product.category.name;
    const current = categoryAgg.get(cat) ?? { units: 0, revenue: 0 };
    categoryAgg.set(cat, {
      units: current.units + item.quantity,
      revenue: current.revenue + item.subtotal,
    });
  }

  const categoryStats = [...categoryAgg.entries()]
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.revenue - a.revenue);

  // Customer geography (top cities)
  const cityAgg = await prisma.order.groupBy({
    by: ['shippingCity'],
    _count: true,
    where: { shippingCity: { not: null } },
    orderBy: { _count: { shippingCity: 'desc' } },
    take: 5,
  });

  // AI-generated insights
  const insights: { type: string; message: string; tone: 'positive' | 'neutral' | 'warning' }[] = [];

  if (categoryStats[0]) {
    insights.push({
      type: 'Product Strategy',
      message: `${categoryStats[0].name} drives the highest revenue (${formatPrice(categoryStats[0].revenue)}). Consider expanding inventory in this category.`,
      tone: 'positive',
    });
  }

  if (peakHour.count > 0) {
    insights.push({
      type: 'Marketing Timing',
      message: `Most orders place between ${peakHour.hour}:00 and ${peakHour.hour + 1}:00. Schedule promotional emails 1-2 hours before this window.`,
      tone: 'neutral',
    });
  }

  if (segmentCounts.New > segmentCounts.Active + segmentCounts.Loyal) {
    insights.push({
      type: 'Retention Risk',
      message: `${segmentCounts.New} customers haven't made their first purchase. Consider a welcome offer to convert them.`,
      tone: 'warning',
    });
  }

  if (segmentCounts.VIP > 0) {
    insights.push({
      type: 'Loyalty Opportunity',
      message: `You have ${segmentCounts.VIP} VIP customers. Personalized previews & private events drive 3× retention for this segment.`,
      tone: 'positive',
    });
  }

  return (
    <div>
      <AdminPageHeader
        eyebrow="AI Analysis"
        title="Customer Insights"
        subtitle="Behavioural patterns, segments, and AI-generated business intelligence"
      />

      {/* AI insights cards */}
      <div className="bg-cream border border-accent mb-10 p-8" style={{
        background: 'linear-gradient(135deg, #FAF7F2 0%, rgba(176, 141, 90, 0.06) 100%)',
      }}>
        <h3 className="font-display text-2xl mb-6 pb-5 border-b border-accent/20 flex items-center gap-3">
          <Lightbulb size={20} className="text-accent" />
          AI-Generated Insights
        </h3>
        {insights.length === 0 ? (
          <p className="text-muted text-sm">No insights available yet — keep gathering data.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-5">
            {insights.map((insight, i) => (
              <div key={i} className="flex gap-3">
                <div
                  className={cn(
                    'w-1 shrink-0',
                    insight.tone === 'positive'
                      ? 'bg-success'
                      : insight.tone === 'warning'
                      ? 'bg-error'
                      : 'bg-accent'
                  )}
                />
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-accent mb-1 font-medium">
                    {insight.type}
                  </div>
                  <p className="text-sm leading-relaxed">{insight.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Customer segments */}
      <div className="bg-cream border border-border p-8 mb-8">
        <h3 className="font-display text-2xl mb-6 pb-5 border-b border-border">
          Customer Segments
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {segments.map((seg) => {
            const pct = totalCustomers > 0 ? (seg.count / totalCustomers) * 100 : 0;
            return (
              <div key={seg.name} className="text-center">
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="44" fill="none" stroke="#E5DDD0" strokeWidth="6" />
                    <circle
                      cx="50"
                      cy="50"
                      r="44"
                      fill="none"
                      stroke={seg.color}
                      strokeWidth="6"
                      strokeDasharray={`${pct * 2.76} 276`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-display text-3xl">{seg.count}</span>
                    <span className="text-[10px] uppercase tracking-widest text-muted">
                      {pct.toFixed(0)}%
                    </span>
                  </div>
                </div>
                <div
                  className="text-xs uppercase tracking-widest font-semibold mb-1"
                  style={{ color: seg.color }}
                >
                  {seg.name}
                </div>
                <p className="text-xs text-muted">{seg.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Peak hours chart */}
      <div className="bg-cream border border-border p-8 mb-8">
        <h3 className="font-display text-2xl mb-2 flex items-center gap-3">
          <Clock size={20} className="text-accent" />
          Peak Shopping Hours
        </h3>
        <p className="text-sm text-muted mb-6">
          Last 30 days · Peak: {peakHour.hour}:00 — {peakHour.hour + 1}:00 ({peakHour.count} orders)
        </p>
        <div className="flex items-end gap-1 h-40">
          {hourlyChart.map((h) => (
            <div
              key={h.hour}
              className="flex-1 flex flex-col items-center justify-end h-full"
            >
              <div
                className={cn(
                  'w-full transition-all hover:opacity-80',
                  h.hour === peakHour.hour
                    ? 'bg-accent'
                    : 'bg-cream-300'
                )}
                style={{
                  height: `${(h.count / maxHourCount) * 100}%`,
                  minHeight: h.count > 0 ? '4px' : '0',
                }}
                title={`${h.hour}:00 — ${h.count} orders`}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-3 text-[10px] text-muted">
          <span>00:00</span>
          <span>06:00</span>
          <span>12:00</span>
          <span>18:00</span>
          <span>23:00</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Category performance */}
        <div className="bg-cream border border-border p-8">
          <h3 className="font-display text-2xl mb-6 pb-5 border-b border-border flex items-center gap-3">
            <TrendingUp size={20} className="text-accent" />
            Top Categories (30d)
          </h3>
          {categoryStats.length === 0 ? (
            <p className="text-muted text-sm">No sales data yet.</p>
          ) : (
            <div className="space-y-4">
              {categoryStats.map((cat) => (
                <div
                  key={cat.name}
                  className="flex items-center justify-between py-3 border-b border-border last:border-b-0"
                >
                  <div>
                    <div className="font-medium">{cat.name}</div>
                    <div className="text-xs text-muted">{cat.units} units sold</div>
                  </div>
                  <div className="font-medium text-accent">{formatPrice(cat.revenue)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top cities */}
        <div className="bg-cream border border-border p-8">
          <h3 className="font-display text-2xl mb-6 pb-5 border-b border-border flex items-center gap-3">
            <MapPin size={20} className="text-accent" />
            Top Cities
          </h3>
          {cityAgg.length === 0 ? (
            <p className="text-muted text-sm">No location data yet.</p>
          ) : (
            <div className="space-y-4">
              {cityAgg.map((city) => (
                <div
                  key={city.shippingCity ?? 'unknown'}
                  className="flex items-center justify-between py-3 border-b border-border last:border-b-0"
                >
                  <div className="font-medium">{city.shippingCity}</div>
                  <div className="text-sm text-muted">{city._count} orders</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
