import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/utils';
import { AdminPageHeader } from '../AdminPageHeader';
import { ProductsClient } from './ProductsClient';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Products · Admin' };

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      include: {
        category: true,
        badges: true,
        _count: { select: { orderItems: true } },
      },
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.category.findMany({ orderBy: { sortOrder: 'asc' } }),
  ]);

  const totalValue = products.reduce(
    (sum, p) => sum + p.price * p.stockQuantity,
    0
  );
  const lowStock = products.filter((p) => p.stockQuantity < 5 && p.isActive).length;

  return (
    <div>
      <AdminPageHeader
        eyebrow="Catalog"
        title="Products"
        subtitle={`${products.length} products · ${formatPrice(totalValue)} inventory value`}
        action={
          <Link href="/admin/products/new" className="btn btn-primary text-xs">
            <Plus size={16} className="mr-1" /> Add Product
          </Link>
        }
      />

      {lowStock > 0 && (
        <div className="mb-8 p-4 border-l-2 border-error bg-error/5 text-sm">
          <strong className="text-error">{lowStock} products</strong>
          <span className="text-muted"> are running low on stock (less than 5 units).</span>
        </div>
      )}

      <ProductsClient initialProducts={products} categories={categories} />
    </div>
  );
}
