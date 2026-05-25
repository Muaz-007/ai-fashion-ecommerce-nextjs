import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { AdminPageHeader } from '../../../AdminPageHeader';
import { ProductForm } from '../../new/ProductForm';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id: Number(id) },
    select: { name: true },
  });
  return { title: product ? `Edit ${product.name} · Admin` : 'Edit Product · Admin' };
}

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params;
  const productId = Number(id);
  if (isNaN(productId)) notFound();

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id: productId },
      include: {
        sizes: true,
        colors: true,
        badges: true,
        tags: true,
      },
    }),
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: { id: true, name: true },
    }),
  ]);

  if (!product) notFound();

  return (
    <div>
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-accent transition-colors mb-6"
      >
        <ArrowLeft size={16} /> Back to Products
      </Link>

      <AdminPageHeader
        eyebrow={`SKU · ${product.sku}`}
        title="Edit Product"
        subtitle={product.name}
        action={
          <Link
            href={`/shop/${product.slug}`}
            target="_blank"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-accent hover:opacity-70 transition-opacity"
          >
            View on storefront <ExternalLink size={14} />
          </Link>
        }
      />

      <ProductForm
        categories={categories}
        initial={{
          id: product.id,
          name: product.name,
          sku: product.sku,
          description: product.description,
          material: product.material,
          careInstructions: product.careInstructions,
          price: product.price,
          originalPrice: product.originalPrice,
          stockQuantity: product.stockQuantity,
          gradient: product.gradient,
          imageUrl: product.imageUrl,
          categoryId: product.categoryId,
          isFeatured: product.isFeatured,
          isActive: product.isActive,
          sizes: product.sizes.map((s) => s.size),
          colors: product.colors.map((c) => c.colorHex),
          badges: product.badges.map((b) => b.badgeType),
          tags: product.tags.map((t) => t.tag),
        }}
      />
    </div>
  );
}
