import { prisma } from '@/lib/prisma';
import { AdminPageHeader } from '../../AdminPageHeader';
import { ProductForm } from './ProductForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'New Product · Admin' };

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    select: { id: true, name: true },
  });

  return (
    <div>
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-accent transition-colors mb-6"
      >
        <ArrowLeft size={16} /> Back to Products
      </Link>

      <AdminPageHeader
        eyebrow="Catalog"
        title="New Product"
        subtitle="Add a new piece to the atelier"
      />

      <ProductForm categories={categories} />
    </div>
  );
}
