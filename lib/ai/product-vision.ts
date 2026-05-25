/**
 * Gemini Vision — analyze a product image and return suggested
 * name, description, material, and tags for the admin product form.
 *
 * Used by /api/admin/ai/describe-product so an admin can upload one
 * photo and have the form pre-fill, cutting product entry time
 * from minutes to seconds.
 */

import { generateJSON, isGeminiEnabled, isGeminiError, type GeminiError } from './gemini';

export interface ProductDescription {
  name: string;
  description: string;
  material: string;
  careInstructions: string;
  tags: string[];
  suggestedCategory: string;
  estimatedPriceRange: { min: number; max: number };
}

const VISION_PROMPT = `You are a senior copywriter for "Maison Aurelle", a luxury Pakistani fashion atelier (Pret, Formal, Bridal, Accessories).

Look at this product photo and write catalog copy with the brand's tone: elegant, refined, evocative — never generic or marketing-fluff.

Return STRICT JSON in exactly this shape:
{
  "name": "Product name in 2-4 evocative words (e.g. 'Aurelle Velvet Lehenga', 'Champagne Silk Saree')",
  "description": "60-100 word luxury copy — describe silhouette, drape, mood, occasion. No bullet points, no asterisks.",
  "material": "Primary fabric(s) you can identify, e.g. 'Pure silk with zardozi embroidery'",
  "careInstructions": "Brief care instructions — dry clean / hand wash etc.",
  "tags": ["5-8 lowercase searchable tags: silhouette + color + occasion + technique"],
  "suggestedCategory": "One of: Pret, Formal, Bridal, Accessories",
  "estimatedPriceRange": { "min": <PKR number>, "max": <PKR number> }
}

Pricing guidance (PKR):
- Pret (everyday): 8,000 — 25,000
- Formal: 20,000 — 80,000
- Bridal: 80,000 — 350,000
- Accessories: 3,000 — 25,000`;

export async function describeProductFromImage(
  imageBase64: string,
  imageMimeType: string
): Promise<ProductDescription | GeminiError> {
  if (!isGeminiEnabled) {
    return { kind: 'unknown', message: 'AI is not configured' };
  }
  return generateJSON<ProductDescription>(VISION_PROMPT, {
    imageBase64,
    imageMimeType,
  });
}

/** Re-export so callers can branch on success vs error without importing gemini.ts. */
export { isGeminiError };
