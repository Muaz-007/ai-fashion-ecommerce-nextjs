'use client';

import { motion } from 'framer-motion';

interface AdminChartsProps {
  monthsData: Array<{ month: string; revenue: number }>;
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Build last-12-months series, filling zeros for months with no data
function buildSeries(data: Array<{ month: string; revenue: number }>) {
  const map = new Map<string, number>();
  for (const d of data) {
    map.set(d.month, Number(d.revenue) || 0);
  }
  const now = new Date();
  const series: Array<{ label: string; revenue: number }> = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = String(d.getMonth() + 1).padStart(2, '0');
    series.push({
      label: MONTH_NAMES[d.getMonth()],
      revenue: map.get(monthKey) ?? 0,
    });
  }
  return series;
}

export function AdminCharts({ monthsData }: AdminChartsProps) {
  const series = buildSeries(monthsData);
  const max = Math.max(...series.map((d) => d.revenue), 1);

  // Fallback demo data if no orders yet
  const displaySeries = series.every((d) => d.revenue === 0)
    ? series.map((s, i) => ({
        ...s,
        revenue: [45, 65, 55, 80, 72, 88, 95, 78, 85, 92, 100, 87][i] * 1000,
      }))
    : series;

  const displayMax = Math.max(...displaySeries.map((d) => d.revenue), 1);

  return (
    <div className="bg-cream p-8 border border-border">
      <div className="flex justify-between items-center mb-6 pb-5 border-b border-border">
        <h3 className="font-display text-2xl">Revenue Overview</h3>
        <select className="px-4 py-2 border border-border bg-transparent text-sm">
          <option>Last 12 months</option>
          <option>Last 6 months</option>
          <option>Last 30 days</option>
        </select>
      </div>

      <div className="h-72 flex items-end gap-3 p-4 bg-gradient-to-t from-accent/5 to-transparent relative">
        {displaySeries.map((data, i) => (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            animate={{ height: `${(data.revenue / displayMax) * 100}%` }}
            transition={{ duration: 0.6, delay: i * 0.05 }}
            className="flex-1 bg-gradient-to-t from-accent-300 to-accent rounded-t-sm relative group cursor-pointer hover:opacity-80 transition-opacity min-h-[8px]"
          >
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-ink text-cream text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              PKR {Math.round(data.revenue / 1000)}K
            </div>
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-muted">
              {data.label}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-12 pt-6 border-t border-border flex gap-8 flex-wrap">
        <div>
          <div className="text-xs text-muted">This Month</div>
          <div className="font-display text-2xl">
            PKR {Math.round(displaySeries[displaySeries.length - 1].revenue / 1000)}K
          </div>
        </div>
        <div>
          <div className="text-xs text-muted">Avg. Order Value</div>
          <div className="font-display text-2xl">PKR 12.4K</div>
        </div>
        <div>
          <div className="text-xs text-muted">Conversion Rate</div>
          <div className="font-display text-2xl">4.2%</div>
        </div>
      </div>
    </div>
  );
}
