/**
 * AI-generated business insights for the admin dashboard.
 *
 * Takes aggregated sales/customer data, asks Gemini to play
 * "fashion-retail business analyst," and returns structured
 * actionable insights. Falls back to deterministic rule-based
 * insights if Gemini is unavailable.
 */

import { generateJSON, isGeminiEnabled, isGeminiError } from './gemini';
import { formatPrice } from '@/lib/utils';
import { unstable_cache } from 'next/cache';

export interface BusinessInsight {
  type: string;
  message: string;
  tone: 'positive' | 'neutral' | 'warning';
  source: 'ai' | 'rule';
}

export interface InsightInput {
  totalCustomers: number;
  segments: { VIP: number; Loyal: number; Active: number; New: number };
  categoryStats: { name: string; units: number; revenue: number }[];
  peakHour: { hour: number; count: number };
  topCities: { city: string; orders: number }[];
}

const PROMPT_TEMPLATE = (data: InsightInput) => `You are a senior business analyst for "Maison Aurelle", a luxury Pakistani fashion e-commerce brand selling Pret, Formal, Bridal & Accessories.

Analyze this last-30-days data and produce 4 sharp, *actionable* business insights for the founder. Each insight must:
- Be specific (cite a number or category from the data).
- Recommend ONE concrete action (not vague advice).
- Reflect Pakistani luxury fashion context (Eid, wedding season, regional preferences).
- Be ≤ 2 sentences, plain prose. No marketing fluff.

DATA:
- Total customers: ${data.totalCustomers}
- Segments — VIP: ${data.segments.VIP}, Loyal: ${data.segments.Loyal}, Active: ${data.segments.Active}, New (no purchase): ${data.segments.New}
- Top categories by revenue:
${data.categoryStats.slice(0, 5).map(c => `  • ${c.name}: ${c.units} units, ${formatPrice(c.revenue)}`).join('\n') || '  • (no sales yet)'}
- Peak shopping hour: ${data.peakHour.hour}:00 (${data.peakHour.count} orders)
- Top cities:
${data.topCities.slice(0, 5).map(c => `  • ${c.city}: ${c.orders} orders`).join('\n') || '  • (no orders yet)'}

Return STRICT JSON in this exact shape:
{
  "insights": [
    {
      "type": "Product Strategy" | "Marketing Timing" | "Retention Risk" | "Loyalty Opportunity" | "Geographic Expansion" | "Pricing" | "Inventory" | "Seasonal",
      "message": "specific actionable insight",
      "tone": "positive" | "neutral" | "warning"
    }
  ]
}`;

interface GeminiResponse {
  insights: Array<{ type: string; message: string; tone: 'positive' | 'neutral' | 'warning' }>;
}

const cachedAI = unstable_cache(
  async (data: InsightInput): Promise<BusinessInsight[] | null> => {
    const result = await generateJSON<GeminiResponse>(PROMPT_TEMPLATE(data));
    if (isGeminiError(result)) return null;
    if (!result?.insights?.length) return null;
    return result.insights.slice(0, 6).map((i) => ({ ...i, source: 'ai' as const }));
  },
  ['ai-insights-v1'],
  { revalidate: 900, tags: ['ai-insights'] } // 15min cache — quota-friendly
);

export async function generateBusinessInsights(
  data: InsightInput
): Promise<BusinessInsight[]> {
  if (isGeminiEnabled) {
    const ai = await cachedAI(data);
    if (ai && ai.length > 0) return ai;
  }
  return fallbackInsights(data);
}

/** Deterministic fallback when Gemini key/quota unavailable. */
function fallbackInsights(data: InsightInput): BusinessInsight[] {
  const out: BusinessInsight[] = [];

  if (data.categoryStats[0]) {
    out.push({
      type: 'Product Strategy',
      message: `${data.categoryStats[0].name} drives the highest revenue (${formatPrice(data.categoryStats[0].revenue)}). Consider expanding inventory in this category.`,
      tone: 'positive',
      source: 'rule',
    });
  }

  if (data.peakHour.count > 0) {
    out.push({
      type: 'Marketing Timing',
      message: `Most orders place between ${data.peakHour.hour}:00 and ${data.peakHour.hour + 1}:00. Schedule promotional emails 1-2 hours before this window.`,
      tone: 'neutral',
      source: 'rule',
    });
  }

  if (data.segments.New > data.segments.Active + data.segments.Loyal) {
    out.push({
      type: 'Retention Risk',
      message: `${data.segments.New} customers haven't made their first purchase. Consider a welcome offer to convert them.`,
      tone: 'warning',
      source: 'rule',
    });
  }

  if (data.segments.VIP > 0) {
    out.push({
      type: 'Loyalty Opportunity',
      message: `You have ${data.segments.VIP} VIP customers. Personalized previews & private events drive 3× retention for this segment.`,
      tone: 'positive',
      source: 'rule',
    });
  }

  return out;
}
