import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/utils';
import { AdminPageHeader } from '../AdminPageHeader';
import { ProductPlaceholder } from '@/components/ProductPlaceholder';
import { AlertTriangle, Package, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Inventory · Admin' };

export default async function InventoryPage() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: {
      category: true,
      sizes: true,
    },
    orderBy: { stockQuantity: 'asc' },
  });

  const totalUnits = products.reduce((sum, p) => sum + p.stockQuantity, 0);
  const totalValue = products.reduce((sum, p) => sum + p.price * p.stockQuantity, 0);
  const lowStock = products.filter((p) => p.stockQuantity < 5);
  const outOfStock = products.filter((p) => p.stockQuantity === 0);

  return (
    <div>
      <AdminPageHeader
        eyebrow="Operations"
        title="Inventory"
        subtitle={`${totalUnits} units in stock · ${formatPrice(totalValue)} inventory value`}
      />

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
        <SummaryCard
          icon={<Package size={20} />}
          label="Active SKUs"
          value={products.length.toString()}
          subtitle={`${formatPrice(totalValue)} value`}
        />
        <SummaryCard
          icon={<AlertTriangle size={20} />}
          label="Low Stock"
          value={lowStock.length.toString()}
          subtitle="Below 5 units"
          tone="warning"
        />
        <SummaryCard
          icon={<TrendingDown size={20} />}
          label="Out of Stock"
          value={outOfStock.length.toString()}
          subtitle="0 units available"
          tone="error"
        />
      </div>

      {/* Low stock alert section */}
      {lowStock.length > 0 && (
        <div className="bg-cream border border-border mb-8">
          <div className="px-6 py-4 border-b border-border flex items-center gap-3">
            <AlertTriangle size={18} className="text-error" />
            <h2 className="font-display text-xl">Restock Alerts</h2>
            <span className="ml-auto text-xs text-muted">
              {lowStock.length} items need attention
            </span>
          </div>
          <div className="divide-y divide-border">
            {lowStock.map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-4 px-6 py-4 hover:bg-cream-200/50 transition-colors"
              >
                <div className="w-14 h-14 overflow-hidden shrink-0">
                  <ProductPlaceholder
                    productId={product.id}
                    productName={product.name}
                    category={product.category.name}
                    gradient={product.gradient}
                    showWordmark={false}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{product.name}</div>
                  <div className="text-xs text-muted">
                    {product.sku} · {product.category.name}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div
                    className={cn(
                      'text-2xl font-display',
                      product.stockQuantity === 0 ? 'text-error' : 'text-accent'
                    )}
                  >
                    {product.stockQuantity}
                  </div>
                  <div className="text-[10px] uppercase tracking-widest text-muted">
                    units left
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full inventory list */}
      <div className="bg-cream border border-border">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-display text-xl">All Inventory</h2>
          <span className="text-xs text-muted">Sorted by stock — lowest first</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-cream-200 text-[11px] uppercase tracking-widest text-muted">
              <tr>
                <th className="text-left p-4 font-semibold">Product</th>
                <th className="text-left p-4 font-semibold hidden md:table-cell">Category</th>
                <th className="text-right p-4 font-semibold">Unit Price</th>
                <th className="text-center p-4 font-semibold">Sizes</th>
                <th className="text-center p-4 font-semibold">Stock</th>
                <th className="text-right p-4 font-semibold hidden lg:table-cell">Value</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="border-t border-border hover:bg-cream-200/50 transition-colors"
                >
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 overflow-hidden shrink-0">
                        <ProductPlaceholder
                          productId={product.id}
                          productName={product.name}
                          category={product.category.name}
                          gradient={product.gradient}
                          showWordmark={false}
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium truncate">{product.name}</div>
                        <div className="text-xs text-muted">{product.sku}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-muted hidden md:table-cell">{product.category.name}</td>
                  <td className="p-3 text-right">{formatPrice(product.price)}</td>
                  <td className="p-3 text-center text-xs text-muted">
                    {product.sizes.length} variants
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={cn(
                        'inline-block px-2.5 py-1 text-xs font-semibold',
                        product.stockQuantity === 0
                          ? 'bg-error/10 text-error'
                          : product.stockQuantity < 5
                          ? 'bg-error/10 text-error'
                          : product.stockQuantity < 15
                          ? 'bg-accent/10 text-accent'
                          : 'bg-success/10 text-success'
                      )}
                    >
                      {product.stockQuantity}
                    </span>
                  </td>
                  <td className="p-3 text-right font-medium hidden lg:table-cell">
                    {formatPrice(product.price * product.stockQuantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  subtitle,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtitle: string;
  tone?: 'warning' | 'error';
}) {
  return (
    <div className="bg-cream border border-border p-6">
      <div className="flex items-center gap-3 mb-3">
        <div
          className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center',
            tone === 'error'
              ? 'bg-error/10 text-error'
              : tone === 'warning'
              ? 'bg-accent/10 text-accent'
              : 'bg-accent/10 text-accent'
          )}
        >
          {icon}
        </div>
        <div className="text-[10px] uppercase tracking-widest text-muted">{label}</div>
      </div>
      <div className="font-display text-3xl">{value}</div>
      <div className="text-xs text-muted mt-1">{subtitle}</div>
    </div>
  );
}
