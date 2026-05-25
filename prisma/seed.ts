// ============================================
// Database Seeder
// Run: npm run db:seed
// ============================================

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...\n');

  // Wipe existing data (for re-seeding)
  await prisma.userActivity.deleteMany();
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.productTag.deleteMany();
  await prisma.productBadge.deleteMany();
  await prisma.productColor.deleteMany();
  await prisma.productSize.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();
  await prisma.promoCode.deleteMany();
  await prisma.newsletterSubscriber.deleteMany();
  await prisma.contactInquiry.deleteMany();

  // Categories
  const categories = await Promise.all([
    prisma.category.create({ data: { name: 'Pret', slug: 'pret', sortOrder: 1, description: 'Ready-to-wear sophistication' } }),
    prisma.category.create({ data: { name: 'Formal', slug: 'formal', sortOrder: 2, description: 'Evening affairs' } }),
    prisma.category.create({ data: { name: 'Bridal', slug: 'bridal', sortOrder: 3, description: 'Hand-crafted masterpieces' } }),
    prisma.category.create({ data: { name: 'Casual', slug: 'casual', sortOrder: 4, description: 'Effortless elegance' } }),
    prisma.category.create({ data: { name: 'Accessories', slug: 'accessories', sortOrder: 5, description: 'Finishing touches' } }),
  ]);

  const catId = (name: string) => categories.find((c) => c.name === name)!.id;
  console.log(`✓ Created ${categories.length} categories`);

  // Users
  const password = await bcrypt.hash('password123', 10);
  await prisma.user.create({
    data: {
      firstName: 'Admin',
      lastName: 'Aurelle',
      email: 'admin@maisonaurelle.pk',
      passwordHash: password,
      phone: '+92 300 0000000',
      role: 'admin',
    },
  });
  await prisma.user.create({
    data: {
      firstName: 'Sara',
      lastName: 'Ahmed',
      email: 'sara@example.com',
      passwordHash: password,
      phone: '+92 300 1111111',
      role: 'customer',
    },
  });
  await prisma.user.create({
    data: {
      firstName: 'Fatima',
      lastName: 'Khan',
      email: 'fatima@example.com',
      passwordHash: password,
      phone: '+92 300 2222222',
      role: 'customer',
    },
  });
  console.log('✓ Created 3 users (password: password123)');

  // Products
  const productsData = [
    {
      name: 'Embroidered Silk Kurta', slug: 'embroidered-silk-kurta', sku: 'MA-0001',
      categoryId: catId('Pret'),
      description: 'An exquisite hand-embroidered silk kurta featuring intricate threadwork in traditional motifs. Crafted from premium silk fabric, this piece exemplifies timeless elegance.',
      material: '100% Mulberry Silk', careInstructions: 'Dry Clean Only',
      price: 8500, originalPrice: 12000, stockQuantity: 25, rating: 4.8, reviewCount: 142, isFeatured: true,
      gradient: 'linear-gradient(135deg, #B08D5A 0%, #6B4F2E 100%)', accentColor: '#D4B896',
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      colors: [{ hex: '#B08D5A', name: 'Gold' }, { hex: '#1A1614', name: 'Black' }, { hex: '#8B6F47', name: 'Tan' }],
      badges: ['sale', 'bestseller'],
      tags: ['embroidered', 'silk', 'formal', 'wedding'],
    },
    {
      name: 'Velvet Anarkali Gown', slug: 'velvet-anarkali-gown', sku: 'MA-0002',
      categoryId: catId('Formal'),
      description: 'A luxurious velvet anarkali gown adorned with intricate zardozi embroidery. Perfect for evening events and grand celebrations.',
      material: 'Premium Velvet with Zardozi Work', careInstructions: 'Dry Clean Only',
      price: 24500, stockQuantity: 12, rating: 4.9, reviewCount: 86, isFeatured: true,
      gradient: 'linear-gradient(135deg, #2C1810 0%, #5C3A28 100%)', accentColor: '#8B6F47',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: [{ hex: '#2C1810', name: 'Espresso' }, { hex: '#5A1A2F', name: 'Maroon' }, { hex: '#1A2F3A', name: 'Navy' }],
      badges: ['new'],
      tags: ['velvet', 'anarkali', 'wedding', 'luxury'],
    },
    {
      name: 'Linen Co-Ord Set', slug: 'linen-co-ord-set', sku: 'MA-0003',
      categoryId: catId('Casual'),
      description: 'A breathable linen co-ord set perfect for everyday elegance. Features relaxed silhouette with thoughtful detailing.',
      material: '100% European Linen', careInstructions: 'Hand Wash Cold',
      price: 6200, stockQuantity: 40, rating: 4.6, reviewCount: 54,
      gradient: 'linear-gradient(135deg, #E8DFCF 0%, #C9B398 100%)', accentColor: '#FAF7F2',
      sizes: ['XS', 'S', 'M', 'L'],
      colors: [{ hex: '#E8DFCF', name: 'Cream' }, { hex: '#F5F1EB', name: 'Off-White' }, { hex: '#D4C4A8', name: 'Sand' }],
      badges: ['new'],
      tags: ['linen', 'casual', 'summer', 'comfort'],
    },
    {
      name: 'Chiffon Saree with Sequins', slug: 'chiffon-saree-sequins', sku: 'MA-0004',
      categoryId: catId('Formal'),
      description: 'A drape of pure elegance — this chiffon saree with delicate sequin work captures light beautifully with every movement.',
      material: 'Pure Chiffon with Sequin Embellishments', careInstructions: 'Dry Clean Only',
      price: 18900, originalPrice: 22000, stockQuantity: 18, rating: 4.7, reviewCount: 198, isFeatured: true,
      gradient: 'linear-gradient(135deg, #5A1A2F 0%, #2C0D17 100%)', accentColor: '#B08D5A',
      sizes: ['One Size'],
      colors: [{ hex: '#5A1A2F', name: 'Maroon' }, { hex: '#1A1614', name: 'Black' }, { hex: '#3A2842', name: 'Plum' }],
      badges: ['sale'],
      tags: ['saree', 'chiffon', 'party', 'elegant'],
    },
    {
      name: 'Cotton Lawn Suit', slug: 'cotton-lawn-suit', sku: 'MA-0005',
      categoryId: catId('Pret'),
      description: 'Premium cotton lawn fabric in a contemporary cut. Lightweight, breathable, and effortlessly chic for daily wear.',
      material: 'Premium Cotton Lawn', careInstructions: 'Machine Wash Cold',
      price: 4200, stockQuantity: 60, rating: 4.5, reviewCount: 312,
      gradient: 'linear-gradient(135deg, #C9B398 0%, #8B6F47 100%)', accentColor: '#E8DFCF',
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      colors: [{ hex: '#C9B398', name: 'Beige' }, { hex: '#A89074', name: 'Mocha' }, { hex: '#6B5D4F', name: 'Taupe' }],
      badges: ['bestseller'],
      tags: ['cotton', 'lawn', 'everyday', 'summer'],
    },
    {
      name: 'Organza Bridal Lehenga', slug: 'organza-bridal-lehenga', sku: 'MA-0006',
      categoryId: catId('Bridal'),
      description: 'A masterpiece bridal lehenga featuring hand-crafted gota work and intricate embellishments. The pinnacle of traditional craftsmanship.',
      material: 'Organza with Gota & Zardozi Work', careInstructions: 'Specialist Dry Clean Only',
      price: 95000, originalPrice: 125000, stockQuantity: 5, rating: 5.0, reviewCount: 47, isFeatured: true,
      gradient: 'linear-gradient(135deg, #B08D5A 0%, #6B4F2E 100%)', accentColor: '#FFD700',
      sizes: ['XS', 'S', 'M', 'L'],
      colors: [{ hex: '#B08D5A', name: 'Gold' }, { hex: '#5A1A2F', name: 'Maroon' }, { hex: '#1A1614', name: 'Black' }],
      badges: ['sale', 'bestseller'],
      tags: ['bridal', 'lehenga', 'wedding', 'luxury', 'embroidered'],
    },
    {
      name: 'Crepe Pleated Dress', slug: 'crepe-pleated-dress', sku: 'MA-0007',
      categoryId: catId('Formal'),
      description: 'A modern silhouette in flowing crepe with delicate pleating. Effortlessly transitions from day to evening occasions.',
      material: 'Premium Crepe', careInstructions: 'Dry Clean Recommended',
      price: 9800, stockQuantity: 22, rating: 4.6, reviewCount: 68,
      gradient: 'linear-gradient(135deg, #1A2F3A 0%, #0D1820 100%)', accentColor: '#4A6878',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: [{ hex: '#1A2F3A', name: 'Navy' }, { hex: '#1A1614', name: 'Black' }, { hex: '#2C1810', name: 'Espresso' }],
      badges: ['new'],
      tags: ['crepe', 'dress', 'office', 'modern'],
    },
    {
      name: 'Hand-Block Print Kurta', slug: 'hand-block-print-kurta', sku: 'MA-0008',
      categoryId: catId('Pret'),
      description: 'Traditional hand-block printing on soft cotton. Each piece is unique, celebrating artisanal heritage.',
      material: 'Hand-Block Printed Cotton', careInstructions: 'Hand Wash Cold',
      price: 5400, stockQuantity: 35, rating: 4.7, reviewCount: 124,
      gradient: 'linear-gradient(135deg, #8B6F47 0%, #5C3A28 100%)', accentColor: '#C9B398',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: [{ hex: '#8B6F47', name: 'Tan' }, { hex: '#C9B398', name: 'Beige' }, { hex: '#5A1A2F', name: 'Maroon' }],
      badges: [],
      tags: ['cotton', 'block-print', 'artisan', 'casual'],
    },
    {
      name: 'Pure Silk Dupatta', slug: 'pure-silk-dupatta', sku: 'MA-0009',
      categoryId: catId('Accessories'),
      description: 'A statement silk dupatta with delicate borderwork. The perfect finishing touch to any ensemble.',
      material: 'Pure Silk with Hand Border', careInstructions: 'Dry Clean Only',
      price: 3800, stockQuantity: 50, rating: 4.8, reviewCount: 92,
      gradient: 'linear-gradient(135deg, #D4B896 0%, #8B6F47 100%)', accentColor: '#F5F1EB',
      sizes: ['One Size'],
      colors: [{ hex: '#D4B896', name: 'Champagne' }, { hex: '#5A1A2F', name: 'Maroon' }, { hex: '#1A2F3A', name: 'Navy' }],
      badges: ['new'],
      tags: ['dupatta', 'silk', 'accessory', 'elegant'],
    },
    {
      name: 'Embellished Sharara Set', slug: 'embellished-sharara-set', sku: 'MA-0010',
      categoryId: catId('Formal'),
      description: 'A regal sharara set featuring intricate embellishments. Flowing silhouette with traditional craftsmanship meets contemporary style.',
      material: 'Premium Crepe with Sequin Work', careInstructions: 'Dry Clean Only',
      price: 16500, originalPrice: 19500, stockQuantity: 15, rating: 4.7, reviewCount: 156, isFeatured: true,
      gradient: 'linear-gradient(135deg, #5A1A2F 0%, #2C0D17 100%)', accentColor: '#B08D5A',
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      colors: [{ hex: '#5A1A2F', name: 'Maroon' }, { hex: '#1A2F3A', name: 'Navy' }, { hex: '#1A1614', name: 'Black' }],
      badges: ['sale'],
      tags: ['sharara', 'formal', 'wedding', 'embellished'],
    },
    {
      name: 'Cashmere Wool Shawl', slug: 'cashmere-wool-shawl', sku: 'MA-0011',
      categoryId: catId('Accessories'),
      description: 'Luxurious 100% cashmere wool shawl, hand-woven by master artisans. An heirloom piece of unmatched softness.',
      material: '100% Pure Cashmere', careInstructions: 'Dry Clean Only',
      price: 14500, stockQuantity: 10, rating: 4.9, reviewCount: 78,
      gradient: 'linear-gradient(135deg, #6B5D4F 0%, #3A2E26 100%)', accentColor: '#C9B398',
      sizes: ['One Size'],
      colors: [{ hex: '#6B5D4F', name: 'Taupe' }, { hex: '#1A1614', name: 'Black' }, { hex: '#8B6F47', name: 'Tan' }],
      badges: ['new'],
      tags: ['cashmere', 'shawl', 'winter', 'luxury'],
    },
    {
      name: 'Tissue Silk Lehenga', slug: 'tissue-silk-lehenga', sku: 'MA-0012',
      categoryId: catId('Bridal'),
      description: 'A romantic tissue silk lehenga adorned with delicate sequins and pearl work. Perfect for engagement ceremonies.',
      material: 'Tissue Silk with Pearl Embellishments', careInstructions: 'Dry Clean Only',
      price: 58000, stockQuantity: 8, rating: 4.9, reviewCount: 36, isFeatured: true,
      gradient: 'linear-gradient(135deg, #B08D5A 0%, #8B6F47 100%)', accentColor: '#FFD700',
      sizes: ['S', 'M', 'L'],
      colors: [{ hex: '#B08D5A', name: 'Gold' }, { hex: '#5A1A2F', name: 'Maroon' }, { hex: '#1A2F3A', name: 'Navy' }],
      badges: ['new', 'bestseller'],
      tags: ['lehenga', 'bridal', 'engagement', 'tissue-silk'],
    },
  ];

  for (const p of productsData) {
    await prisma.product.create({
      data: {
        name: p.name, slug: p.slug, sku: p.sku, categoryId: p.categoryId,
        description: p.description, material: p.material, careInstructions: p.careInstructions,
        price: p.price, originalPrice: p.originalPrice ?? null, stockQuantity: p.stockQuantity,
        rating: p.rating, reviewCount: p.reviewCount, isFeatured: p.isFeatured ?? false,
        gradient: p.gradient, accentColor: p.accentColor,
        sizes: { create: p.sizes.map((s) => ({ size: s, stock: Math.floor(p.stockQuantity / p.sizes.length) })) },
        colors: { create: p.colors.map((c) => ({ colorHex: c.hex, colorName: c.name })) },
        badges: { create: p.badges.map((b) => ({ badgeType: b })) },
        tags: { create: p.tags.map((t) => ({ tag: t })) },
      },
    });
  }
  console.log(`✓ Created ${productsData.length} products`);

  // Promo codes
  await prisma.promoCode.createMany({
    data: [
      { code: 'WELCOME10', discountType: 'percentage', discountValue: 10, minOrderAmount: 5000, maxUses: 1000 },
      { code: 'FREESHIP', discountType: 'fixed', discountValue: 500, minOrderAmount: 3000, maxUses: 500 },
      { code: 'BRIDAL20', discountType: 'percentage', discountValue: 20, minOrderAmount: 50000, maxUses: 100 },
    ],
  });
  console.log('✓ Created 3 promo codes');

  // Sample orders for dashboard analytics
  const sara = await prisma.user.findUnique({ where: { email: 'sara@example.com' } });
  const fatima = await prisma.user.findUnique({ where: { email: 'fatima@example.com' } });
  const velvet = await prisma.product.findUnique({ where: { slug: 'velvet-anarkali-gown' } });
  const bridal = await prisma.product.findUnique({ where: { slug: 'organza-bridal-lehenga' } });

  if (sara && velvet) {
    await prisma.order.create({
      data: {
        orderNumber: 'MA-1247-26', userId: sara.id,
        subtotal: 49000, shippingCost: 0, tax: 2450, total: 51450,
        status: 'delivered', paymentMethod: 'card', paymentStatus: 'paid',
        shippingFirstName: 'Sara', shippingLastName: 'Ahmed',
        shippingEmail: sara.email, shippingPhone: sara.phone ?? '',
        shippingStreet: '12 DHA Phase 5', shippingCity: 'Lahore', shippingPostalCode: '54000', shippingCountry: 'Pakistan',
        items: {
          create: [{ productId: velvet.id, productName: velvet.name, size: 'M', quantity: 2, unitPrice: 24500, subtotal: 49000 }],
        },
      },
    });
  }

  if (fatima && bridal) {
    await prisma.order.create({
      data: {
        orderNumber: 'MA-1246-26', userId: fatima.id,
        subtotal: 95000, shippingCost: 0, tax: 4750, total: 99750,
        status: 'processing', paymentMethod: 'bank_transfer', paymentStatus: 'paid',
        shippingFirstName: 'Fatima', shippingLastName: 'Khan',
        shippingEmail: fatima.email, shippingPhone: fatima.phone ?? '',
        shippingStreet: '45 Bahria Town', shippingCity: 'Karachi', shippingPostalCode: '75000', shippingCountry: 'Pakistan',
        items: {
          create: [{ productId: bridal.id, productName: bridal.name, size: 'S', quantity: 1, unitPrice: 95000, subtotal: 95000 }],
        },
      },
    });
  }
  console.log('✓ Created sample orders');

  console.log('\n🎉 Seeding complete!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Admin:    admin@maisonaurelle.pk / password123');
  console.log('  Customer: sara@example.com / password123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
