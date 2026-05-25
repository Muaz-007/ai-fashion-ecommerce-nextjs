/**
 * AI re-ranker for personal product recommendations.
 *
 * The rule-based engine in lib/recommendations.ts produces a scored
 * candidate list. This module asks Gemini to pick the *best* N from
 * the top-K candidates based on the user's actual interest pattern,
 * with a short human-readable reason.
 *
 * Gracefully no-ops (returns null) when Gemini is unavailable or
 * the user profile is too cold to benefit — caller keeps the
 * rule-based order in those cases.
 */

import { generateJSON, isGeminiEnabled, isGeminiError } from './gemini';
import type { Prisma } from '@prisma/client';

type ProductWithRelations = Prisma.ProductGetPayload<{
  include: { category: true; tags: true; badges: true };
}>;

interface RerankInput {
  userInterests: string[]; // top categories
  priceRange: { min: number; max: number };
  recentlyViewedNames: string[];
  candidates: ProductWithRelations[];
  pick: number;
}

interface RerankOutput {
  productIds: number[];
  reason: string;
}

export async function rerankRecommendations(
  input: RerankInput
): Promise<RerankOutput | null> {
  if (!isGeminiEnabled) return null;
  if (input.candidates.length <= input.pick) {
    // Nothing to re-rank — return candidates as-is
    return {
      productIds: input.candidates.slice(0, input.pick).map((c) => c.id),
      reason: 'Based on your recent activity',
    };
  }

  const slimCandidates = input.candidates.slice(0, 20).map((c) => ({
    id: c.id,
    name: c.name,
    category: c.category.name,
    price: c.price,
    tags: c.tags.slice(0, 5).map((t) => t.tag),
    featured: c.badges.some((b) => b.badgeType === 'bestseller'),
  }));

  const prompt = `You are a personal stylist for "Maison Aurelle", a luxury Pakistani fashion brand.

A returning customer's recent behavior shows interest in: ${input.userInterests.join(', ') || 'various'}.
Price comfort zone: PKR ${input.priceRange.min.toFixed(0)} – ${input.priceRange.max.toFixed(0)}.
Recently viewed: ${input.recentlyViewedNames.slice(0, 5).join(', ') || '(none)'}.

From this candidate catalog, select the ${input.pick} pieces this customer is most likely to love. Avoid recommending items too similar to each other (vary silhouette/occasion). Prefer items that complement what they've already viewed.

CANDIDATES:
${JSON.stringify(slimCandidates, null, 0)}

Return STRICT JSON:
{
  "productIds": [${input.pick} numeric IDs from the candidates],
  "reason": "≤ 18 words explaining the curation logic in personal, warm tone"
}`;

  const result = await generateJSON<RerankOutput>(prompt);
  if (isGeminiError(result)) return null;
  if (!result?.productIds?.length) return null;

  // Validate: all IDs must exist in candidates
  const candidateIds = new Set(input.candidates.map((c) => c.id));
  const validIds = result.productIds.filter((id) => candidateIds.has(id));
  if (validIds.length === 0) return null;

  return { productIds: validIds.slice(0, input.pick), reason: result.reason };
}
