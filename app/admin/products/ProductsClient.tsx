'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { ProductPlaceholder } from '@/components/ProductPlaceholder';
import { Select } from '@/components/Select';
import { formatPrice, cn } from '@/lib/utils';

interface Product {
  id: number;
  name: string;
  slug: string;
  sku: string;
  price: number;
  originalPrice: number | null;
  stockQuantity: number;
  gradient: string | null;
  imageUrl: string | null;
  isActive: boolean;
  isFeatured: boolean;
  category: { id: number; name: string };
  badges: { badgeType: string }[];
  _count: { orderItems: number };
}

interface ProductsClientProps {
  initialProducts: Product[];
  categories: { id: number; name: string }[];
}

export function ProductsClient({ initialProducts, categories }: ProductsClientProps) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [status, setStatus] = useState<'all' | 'active' | 'inactive' | 'low'>('all');

  const filtered = useMemo(() => {
    return initialProducts.filter((p) => {
      if (search) {
        const q = search.toLowerCase();
        const hay = `${p.name} ${p.sku}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (categoryFilter !== 'All' && p.category.name !== categoryFilter) return false;
      if (status === 'active' && !p.isActive) return false;
      if (status === 'inactive' && p.isActive) return false;
      if (status === 'low' && p.stockQuantity >= 5) return false;
      return true;
    });
  }, [initialProducts, search, categoryFilter, status]);

  return (
    <div className="bg-cream border border-border">
      {/* Toolbar */}
      <div className="p-4 border-b border-border flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-light pointer-events-none"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or SKU..."
            className="w-full pl-10 pr-4 py-2.5 bg-cream-200 text-sm focus:outline-none focus:bg-cream border border-border focus:border-accent transition-colors"
          />
        </div>
        <div className="min-w-[180px]">
          <Select
            options={[
              { value: 'All', label: 'All Categories' },
              ...categories.map((c) => ({ value: c.name, label: c.name })),
            ]}
            value={categoryFilter}
            onChange={setCategoryFilter}
            ariaLabel="Filter by category"
          />
        </div>
        <div className="min-w-[160px]">
          <Select
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'active', label: 'Active Only' },
              { value: 'inactive', label: 'Inactive Only' },
              { value: 'low', label: 'Low Stock' },
            ]}
            value={status}
            onChange={(v) => setStatus(v as 'all' | 'active' | 'inactive' | 'low')}
            ariaLabel="Filter by status"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-cream-200 text-[11px] uppercase tracking-widest text-muted">
            <tr>
              <th className="text-left p-4 font-semibold">Product</th>
              <th className="text-left p-4 font-semibold hidden md:table-cell">SKU</th>
              <th className="text-left p-4 font-semibold hidden md:table-cell">Category</th>
              <th className="text-right p-4 font-semibold">Price</th>
              <th className="text-center p-4 font-semibold">Stock</th>
              <th className="text-center p-4 font-semibold hidden lg:table-cell">Sold</th>
              <th className="text-center p-4 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-16 text-muted">
                  No products match the filters.
                </td>
              </tr>
            ) : (
              filtered.map((product) => (
                <tr
                  key={product.id}
                  className="border-t border-border hover:bg-cream-200/50 transition-colors"
                >
                  <td className="p-3">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="flex items-center gap-3 min-w-0 group"
                    >
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
                        <div className="font-medium truncate group-hover:text-accent transition-colors">
                          {product.name}
                        </div>
                        <div className="text-xs text-muted md:hidden">
                          {product.sku} · {product.category.name}
                        </div>
                      </div>
                    </Link>
                  </td>
                  <td className="p-3 text-muted text-xs hidden md:table-cell">{product.sku}</td>
                  <td className="p-3 text-muted hidden md:table-cell">{product.category.name}</td>
                  <td className="p-3 text-right">
                    <div className="font-medium">{formatPrice(product.price)}</div>
                    {product.originalPrice && (
                      <div className="text-xs text-muted-light line-through">
                        {formatPrice(product.originalPrice)}
                      </div>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={cn(
                        'inline-block px-2.5 py-1 text-xs font-semibold',
                        product.stockQuantity < 5
                          ? 'bg-error/10 text-error'
                          : product.stockQuantity < 15
                          ? 'bg-accent/10 text-accent'
                          : 'bg-success/10 text-success'
                      )}
                    >
                      {product.stockQuantity}
                    </span>
                  </td>
                  <td className="p-3 text-center text-muted hidden lg:table-cell">
                    {product._count.orderItems}
                  </td>
                  <td className="p-3 text-center">
                    {product.isActive ? (
                      <span className="inline-flex items-center gap-1.5 text-xs text-success">
                        <span className="w-1.5 h-1.5 rounded-full bg-success" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs text-muted">
                        <span className="w-1.5 h-1.5 rounded-full bg-muted" />
                        Inactive
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-border text-xs text-muted flex justify-between">
        <span>Showing {filtered.length} of {initialProducts.length} products</span>
        <span>Inventory value: {formatPrice(filtered.reduce((sum, p) => sum + p.price * p.stockQuantity, 0))}</span>
      </div>
    </div>
  );
}
