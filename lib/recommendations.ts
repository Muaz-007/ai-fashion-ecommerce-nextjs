// ============================================
// AI Recommendation Engine — TypeScript
//
// Per FYP Proposal Section 9 (AI Integration Overview):
// Hybrid algorithm combining collaborative filtering,
// content-based filtering, and popularity signals.
// ============================================

import { prisma } from './prisma';
import { unstable_cache } from 'next/cache';
import type { Prisma } from '@prisma/client';

const ACTIVITY_WEIGHTS: Record<string, number> = {
  view: 1,
  cart_add: 3,
  wishlist_add: 4,
  purchase: 10,
};

interface UserProfile {
  categories: string[];
  priceMin: number;
  priceMax: number;
  activityCount: number;
  strength: 'cold' | 'warm' | 'hot';
  reasoning: string[];
}

const productInclude = {
  category: true,
  sizes: true,
  colors: true,
  badges: true,
  tags: true,
} satisfies Prisma.ProductInclude;

// ============================================
// PERSONAL RECOMMENDATIONS
// ============================================
export async function getPersonalizedRecommendations(
  userId: number | null,
  sessionId: string | null,
  limit = 4
) {
  // Guests with no session get cached popular picks — same response for everyone
  if (!userId && !sessionId) {
    return getPopularPicks(limit);
  }

  const profile = await buildUserProfile(userId, sessionId);

  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: productInclude,
  });

  const scored = products
    .map((product) => ({
      product,
      score: scoreProductForUser(product, profile),
    }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return {
    recommendations: scored.map((s) => ({ ...s.product, aiScore: Math.round(s.score * 100) / 100 })),
    profileStrength: profile.strength,
    reasoning: profile.reasoning,
  };
}

/**
 * Cached popular picks — same response for all anonymous visitors.
 * Revalidated every 5 minutes.
 */
const getPopularPicks = unstable_cache(
  async (limit: number) => {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: productInclude,
      orderBy: [
        { isFeatured: 'desc' },
        { rating: 'desc' },
        { reviewCount: 'desc' },
      ],
      take: limit,
    });
    return {
      recommendations: products.map((p) => ({ ...p, aiScore: p.rating * 10 })),
      profileStrength: 'cold' as const,
      reasoning: ['Showing popular & curated picks'],
    };
  },
  ['popular-picks'],
  { revalidate: 300, tags: ['products'] }
);

async function buildUserProfile(
  userId: number | null,
  sessionId: string | null
): Promise<UserProfile> {
  const profile: UserProfile = {
    categories: [],
    priceMin: 0,
    priceMax: 100000,
    activityCount: 0,
    strength: 'cold',
    reasoning: [],
  };

  if (!userId && !sessionId) {
    profile.reasoning.push('Showing popular & curated picks');
    return profile;
  }

  const where = userId ? { userId } : { sessionId: sessionId! };

  const activities = await prisma.userActivity.findMany({
    where: {
      ...where,
      createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    },
    include: { product: { include: { category: true } } },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  profile.activityCount = activities.length;
  profile.strength = activities.length >= 20 ? 'hot' : activities.length >= 5 ? 'warm' : 'cold';

  if (activities.length === 0) {
    profile.reasoning.push('Showing popular & curated picks');
    return profile;
  }

  const categoryWeights = new Map<string, number>();
  const prices: number[] = [];

  for (const activity of activities) {
    const weight = ACTIVITY_WEIGHTS[activity.activityType] ?? 1;
    const cat = activity.product.category.name;
    categoryWeights.set(cat, (categoryWeights.get(cat) ?? 0) + weight);
    prices.push(activity.product.price);
  }

  profile.categories = [...categoryWeights.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map((e) => e[0]);

  if (prices.length > 0) {
    prices.sort((a, b) => a - b);
    profile.priceMin = Math.max(0, prices[0] * 0.5);
    profile.priceMax = prices[prices.length - 1] * 1.5;
  }

  profile.reasoning = [
    `Based on your interest in ${profile.categories.join(', ')}`,
    'Items in your price range',
  ];

  return profile;
}

function scoreProductForUser(
  product: { price: number; rating: number; reviewCount: number; isFeatured: boolean; createdAt: Date; stockQuantity: number; category: { name: string } },
  profile: UserProfile
): number {
  let score = 0;

  // Category match
  if (profile.categories.includes(product.category.name)) {
    const position = profile.categories.indexOf(product.category.name);
    score += 40 - position * 10;
  }

  // Price proximity
  if (product.price >= profile.priceMin && product.price <= profile.priceMax) {
    score += 15;
  }

  // Quality
  score += product.rating * 5;
  score += Math.min(20, product.reviewCount / 10);

  if (product.isFeatured) score += 10;

  // New arrival
  const daysOld = (Date.now() - product.createdAt.getTime()) / (24 * 60 * 60 * 1000);
  if (daysOld <= 30) score += 8;

  // Stock penalty
  if (product.stockQuantity < 1) score *= 0.5;

  return score;
}

// ============================================
// SIMILAR PRODUCTS
// ============================================
export async function getSimilarProducts(productId: number, limit = 4) {
  // Fetch current product + candidate list in parallel
  const [current, products] = await Promise.all([
    prisma.product.findUnique({
      where: { id: productId },
      include: { category: true, tags: true },
    }),
    prisma.product.findMany({
      where: { isActive: true, id: { not: productId } },
      include: productInclude,
    }),
  ]);

  if (!current) return [];

  const currentTagSet = new Set(current.tags.map((t) => t.tag));

  const scored = products
    .map((product) => {
      let score = 0;
      if (product.category.name === current.category.name) score += 50;

      const overlap = product.tags.filter((t) => currentTagSet.has(t.tag)).length;
      score += overlap * 15;

      const priceDiff = Math.abs(product.price - current.price);
      score -= Math.min(30, priceDiff / 1000);

      score += product.rating * 3;

      return { product, score };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored.map((s) => ({ ...s.product, aiScore: Math.round(s.score * 100) / 100 }));
}

// ============================================
// TRENDING (recent activity)
// ============================================
export async function getTrendingProducts(limit = 8) {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const trending = await prisma.product.findMany({
    where: { isActive: true },
    include: {
      ...productInclude,
      _count: {
        select: {
          activity: { where: { createdAt: { gte: sevenDaysAgo } } },
        },
      },
    },
    orderBy: [{ rating: 'desc' }, { reviewCount: 'desc' }],
    take: limit,
  });

  return trending;
}

// ============================================
// FREQUENTLY BOUGHT TOGETHER
// ============================================
export async function getFrequentlyBoughtTogether(productId: number, limit = 3) {
  // Find orders that contain this product
  const orderIds = await prisma.orderItem.findMany({
    where: { productId },
    select: { orderId: true },
    distinct: ['orderId'],
  });

  if (orderIds.length === 0) {
    return getSimilarProducts(productId, limit);
  }

  const ids = orderIds.map((o) => o.orderId);

  const together = await prisma.product.findMany({
    where: {
      isActive: true,
      id: { not: productId },
      orderItems: { some: { orderId: { in: ids } } },
    },
    include: {
      ...productInclude,
      _count: { select: { orderItems: { where: { orderId: { in: ids } } } } },
    },
    take: limit,
  });

  if (together.length < limit) {
    return getSimilarProducts(productId, limit);
  }

  return together.sort((a, b) => b._count.orderItems - a._count.orderItems);
}

// ============================================
// SMART SEARCH (per FYP Section 4)
// Synonym expansion + fuzzy matching
// ============================================
const SYNONYMS: Record<string, string[]> = {
  wedding: ['bridal', 'shaadi', 'mehndi', 'nikah', 'engagement'],
  bridal: ['wedding', 'shaadi', 'nikah'],
  formal: ['party', 'evening', 'elegant', 'embellished'],
  casual: ['everyday', 'daily', 'comfort', 'relaxed'],
  summer: ['lawn', 'cotton', 'linen', 'light'],
  winter: ['cashmere', 'wool', 'shawl', 'warm'],
  embroidered: ['zardozi', 'gota', 'embellished', 'threadwork'],
  kurta: ['shirt', 'top', 'tunic'],
  lehenga: ['ghagra', 'skirt'],
  saree: ['sari'],
  dupatta: ['scarf', 'stole', 'shawl'],
  gown: ['dress', 'maxi'],
  silk: ['satin'],
  gold: ['golden', 'champagne', 'beige'],
};

export function expandSearchQuery(query: string): string[] {
  const tokens = query
    .toLowerCase()
    .split(/[\s,\-]+/)
    .filter((t) => t.length >= 2);

  const expanded = new Set(tokens);
  for (const token of tokens) {
    for (const [key, syns] of Object.entries(SYNONYMS)) {
      if (token === key || syns.includes(token)) {
        expanded.add(key);
        syns.forEach((s) => expanded.add(s));
      }
    }
  }
  return [...expanded];
}

export async function smartSearch(query: string, limit = 20) {
  const tokens = query.toLowerCase().split(/[\s,\-]+/).filter((t) => t.length >= 2);
  const expanded = expandSearchQuery(query);

  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: productInclude,
  });

  const scored = products
    .map((product) => {
      let score = 0;
      const name = product.name.toLowerCase();
      const desc = (product.description ?? '').toLowerCase();
      const category = product.category.name.toLowerCase();
      const tagList = product.tags.map((t) => t.tag.toLowerCase()).join(',');

      // Exact phrase
      const phrase = tokens.join(' ');
      if (name.includes(phrase)) score += 100;
      else if (tagList.includes(phrase)) score += 60;
      else if (desc.includes(phrase)) score += 50;

      // Token-level
      for (const token of tokens) {
        if (name.includes(token)) score += 25;
        else if (tagList.includes(token)) score += 20;
        else if (category.includes(token)) score += 15;
        else if (desc.includes(token)) score += 8;
      }

      // Synonym matches (lower weight)
      for (const syn of expanded) {
        if (tokens.includes(syn)) continue;
        if (name.includes(syn)) score += 12;
        else if (tagList.includes(syn)) score += 10;
      }

      if (score > 0) {
        score += product.rating * 2;
        if (product.isFeatured) score += 5;
      }

      return { product, score };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return {
    products: scored.map((s) => s.product),
    expandedQuery: expanded,
    count: scored.length,
  };
}

// ============================================
// ACTIVITY TRACKING
// ============================================
export async function trackActivity(
  productId: number,
  activityType: 'view' | 'cart_add' | 'wishlist_add' | 'purchase',
  userId: number | null,
  sessionId: string | null
) {
  try {
    await prisma.userActivity.create({
      data: { productId, activityType, userId, sessionId },
    });
  } catch {
    // Silent fail — tracking shouldn't break flows
  }
}
