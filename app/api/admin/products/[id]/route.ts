// ============================================
// PUT    /api/admin/products/[id] — update product
// DELETE /api/admin/products/[id] — delete product (hard delete)
// Admin-only.
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { slugify } from '@/lib/utils';

const UpdateSchema = z.object({
  name: z.string().min(2),
  categoryId: z.number().int().positive(),
  sku: z.string().optional(),
  description: z.string().nullable().optional(),
  material: z.string().nullable().optional(),
  careInstructions: z.string().nullable().optional(),
  price: z.number().positive(),
  originalPrice: z.number().positive().nullable().optional(),
  stockQuantity: z.number().int().min(0),
  gradient: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  sizes: z.array(z.string()).min(1, 'At least one size required'),
  colors: z.array(z.string()).optional(),
  badges: z.array(z.enum(['new', 'sale', 'bestseller'])).optional(),
  tags: z.array(z.string()).optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

async function getUniqueSlug(name: string, currentSlug: string) {
  const desired = slugify(name);
  if (desired === currentSlug) return currentSlug;
  let candidate = desired;
  let n = 1;
  while (
    await prisma.product.findFirst({
      where: { slug: candidate, NOT: { slug: currentSlug } },
    })
  ) {
    n++;
    candidate = `${desired}-${n}`;
  }
  return candidate;
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const productId = Number(id);

  const existing = await prisma.product.findUnique({ where: { id: productId } });
  if (!existing) {
    return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
  }

  let data: z.infer<typeof UpdateSchema>;
  try {
    data = UpdateSchema.parse(await req.json());
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: e.errors[0]?.message ?? 'Invalid input' },
        { status: 422 }
      );
    }
    return NextResponse.json({ success: false, message: 'Invalid input' }, { status: 422 });
  }

  // Verify category
  const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
  if (!category) {
    return NextResponse.json(
      { success: false, message: 'Invalid category' },
      { status: 422 }
    );
  }

  // SKU uniqueness if changed
  const finalSku = data.sku?.trim() || existing.sku;
  if (finalSku !== existing.sku) {
    const collision = await prisma.product.findFirst({
      where: { sku: finalSku, NOT: { id: productId } },
    });
    if (collision) {
      return NextResponse.json(
        { success: false, message: `SKU "${finalSku}" is already taken` },
        { status: 409 }
      );
    }
  }

  const newSlug = await getUniqueSlug(data.name, existing.slug);

  try {
    // Use a transaction so partial relation updates don't leave inconsistent state
    await prisma.$transaction(async (tx) => {
      // Update scalar fields. For Prisma update on a required relation,
      // use `category: { connect: ... }` instead of `categoryId` directly.
      await tx.product.update({
        where: { id: productId },
        data: {
          name: data.name,
          slug: newSlug,
          sku: finalSku,
          category: { connect: { id: data.categoryId } },
          description: data.description ?? null,
          material: data.material ?? null,
          careInstructions: data.careInstructions ?? null,
          price: data.price,
          originalPrice: data.originalPrice ?? null,
          stockQuantity: data.stockQuantity,
          gradient: data.gradient ?? null,
          imageUrl: data.imageUrl ?? null,
          isActive: data.isActive ?? true,
          isFeatured: data.isFeatured ?? false,
        },
      });

      // Replace nested relations (simplest correct behavior — delete then recreate)
      await tx.productSize.deleteMany({ where: { productId } });
      await tx.productColor.deleteMany({ where: { productId } });
      await tx.productBadge.deleteMany({ where: { productId } });
      await tx.productTag.deleteMany({ where: { productId } });

      const stockPerSize = Math.floor(data.stockQuantity / data.sizes.length);

      if (data.sizes.length) {
        await tx.productSize.createMany({
          data: data.sizes.map((size) => ({ productId, size, stock: stockPerSize })),
        });
      }
      if (data.colors?.length) {
        await tx.productColor.createMany({
          data: data.colors.map((colorHex) => ({ productId, colorHex })),
        });
      }
      if (data.badges?.length) {
        await tx.productBadge.createMany({
          data: data.badges.map((badgeType) => ({ productId, badgeType })),
        });
      }
      if (data.tags?.length) {
        await tx.productTag.createMany({
          data: data.tags.map((tag) => ({ productId, tag })),
        });
      }
    });

    return NextResponse.json({ success: true, message: 'Product updated' });
  } catch (e) {
    console.error('Product update error:', e);
    return NextResponse.json(
      { success: false, message: 'Could not update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const productId = Number(id);

  const existing = await prisma.product.findUnique({
    where: { id: productId },
    include: { _count: { select: { orderItems: true } } },
  });

  if (!existing) {
    return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
  }

  // If product has order history, soft-delete (mark inactive) to preserve order records
  if (existing._count.orderItems > 0) {
    await prisma.product.update({
      where: { id: productId },
      data: { isActive: false },
    });
    return NextResponse.json({
      success: true,
      message: 'Product archived (has past orders — kept for records)',
    });
  }

  // Otherwise hard delete (cascades to sizes/colors/badges/tags via schema)
  await prisma.product.delete({ where: { id: productId } });

  return NextResponse.json({ success: true, message: 'Product deleted' });
}
