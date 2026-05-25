// ============================================
// POST /api/admin/products — create a new product
// Admin-only. Creates the Product row + its sizes/colors/badges/tags.
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { slugify } from '@/lib/utils';

const CreateSchema = z.object({
  name: z.string().min(2),
  categoryId: z.number().int().positive(),
  sku: z.string().optional(),
  description: z.string().optional(),
  material: z.string().optional(),
  careInstructions: z.string().optional(),
  price: z.number().positive(),
  originalPrice: z.number().positive().nullable().optional(),
  stockQuantity: z.number().int().min(0),
  gradient: z.string().optional(),
  variant: z.string().optional(),
  sizes: z.array(z.string()).min(1, 'At least one size required'),
  colors: z.array(z.string()).optional(),
  badges: z.array(z.enum(['new', 'sale', 'bestseller'])).optional(),
  tags: z.array(z.string()).optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

async function generateUniqueSlug(baseName: string): Promise<string> {
  const base = slugify(baseName);
  let candidate = base;
  let n = 1;
  // Loop until we find a slug not in use
  while (await prisma.product.findUnique({ where: { slug: candidate } })) {
    n++;
    candidate = `${base}-${n}`;
  }
  return candidate;
}

async function generateUniqueSku(): Promise<string> {
  // Find max existing MA-XXXX number and add 1
  const products = await prisma.product.findMany({
    where: { sku: { startsWith: 'MA-' } },
    select: { sku: true },
  });
  const nums = products
    .map((p) => parseInt(p.sku.replace('MA-', ''), 10))
    .filter((n) => !isNaN(n));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `MA-${String(next).padStart(4, '0')}`;
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
  }

  let data: z.infer<typeof CreateSchema>;
  try {
    data = CreateSchema.parse(await req.json());
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: e.errors[0]?.message ?? 'Invalid input', errors: e.errors },
        { status: 422 }
      );
    }
    return NextResponse.json({ success: false, message: 'Invalid input' }, { status: 422 });
  }

  const slug = await generateUniqueSlug(data.name);
  const sku = data.sku?.trim() || (await generateUniqueSku());

  // Verify SKU is unique if user provided one
  if (data.sku) {
    const existing = await prisma.product.findUnique({ where: { sku } });
    if (existing) {
      return NextResponse.json(
        { success: false, message: `SKU "${sku}" is already taken` },
        { status: 409 }
      );
    }
  }

  // Verify category exists
  const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
  if (!category) {
    return NextResponse.json(
      { success: false, message: 'Invalid category' },
      { status: 422 }
    );
  }

  try {
    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug,
        sku,
        categoryId: data.categoryId,
        description: data.description ?? null,
        material: data.material ?? null,
        careInstructions: data.careInstructions ?? null,
        price: data.price,
        originalPrice: data.originalPrice ?? null,
        stockQuantity: data.stockQuantity,
        gradient: data.gradient ?? null,
        isActive: data.isActive ?? true,
        isFeatured: data.isFeatured ?? false,
        // Nested writes for relations
        sizes: {
          create: data.sizes.map((size) => ({
            size,
            stock: Math.floor(data.stockQuantity / data.sizes.length),
          })),
        },
        colors: data.colors?.length
          ? {
              create: data.colors.map((colorHex) => ({ colorHex })),
            }
          : undefined,
        badges: data.badges?.length
          ? {
              create: data.badges.map((badgeType) => ({ badgeType })),
            }
          : undefined,
        tags: data.tags?.length
          ? {
              create: data.tags.map((tag) => ({ tag })),
            }
          : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Product created',
      data: { product },
    });
  } catch (e) {
    console.error('Product create error:', e);
    return NextResponse.json(
      { success: false, message: 'Could not create product' },
      { status: 500 }
    );
  }
}
