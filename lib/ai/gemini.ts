/**
 * Google Gemini AI client.
 *
 * Single shared instance — re-used across all AI features (insights,
 * product-vision, recommendations re-rank).
 *
 * Gracefully no-ops when GEMINI_API_KEY is missing — every consumer is
 * expected to fall back to rule-based logic in that case, so the app
 * still works end-to-end without a key.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;

export const isGeminiEnabled = Boolean(apiKey && apiKey.length > 10);

const client = apiKey ? new GoogleGenerativeAI(apiKey) : null;

/** Cheap, fast model — best free-tier RPM. Use for everything by default. */
export function getFlashModel() {
  if (!client) return null;
  return client.getGenerativeModel({
    model: 'gemini-flash-latest',
    generationConfig: {
      temperature: 0.4,
      responseMimeType: 'application/json',
    },
  });
}

/** Vision-capable model for image analysis. */
export function getVisionModel() {
  if (!client) return null;
  return client.getGenerativeModel({
    model: 'gemini-flash-latest',
    generationConfig: {
      temperature: 0.3,
      responseMimeType: 'application/json',
    },
  });
}

export interface GeminiError {
  kind: 'quota' | 'network' | 'parse' | 'unknown';
  message: string;
  retryAfterMs?: number;
}

/**
 * Call Gemini and parse a JSON response.
 * Returns either a parsed T or a structured GeminiError so callers can
 * decide whether to fall back, surface a user-facing message, or retry.
 */
export async function generateJSON<T>(
  prompt: string,
  options: { imageBase64?: string; imageMimeType?: string } = {}
): Promise<T | GeminiError> {
  const model = options.imageBase64 ? getVisionModel() : getFlashModel();
  if (!model) return { kind: 'unknown', message: 'Gemini not configured' };

  try {
    const parts: Array<
      { text: string } | { inlineData: { data: string; mimeType: string } }
    > = [{ text: prompt }];

    if (options.imageBase64 && options.imageMimeType) {
      parts.push({
        inlineData: {
          data: options.imageBase64,
          mimeType: options.imageMimeType,
        },
      });
    }

    const result = await model.generateContent({
      contents: [{ role: 'user', parts }],
    });

    const text = result.response.text().trim();
    return JSON.parse(text) as T;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[gemini] generateJSON failed:', message);

    // 429 quota exceeded — most common failure on free tier
    if (message.includes('429') || /quota/i.test(message)) {
      const retryMatch = message.match(/retry in (\d+(?:\.\d+)?)s/i);
      return {
        kind: 'quota',
        message:
          'AI quota reached for now. Free tier is limited — try again in a minute.',
        retryAfterMs: retryMatch ? Math.ceil(parseFloat(retryMatch[1]) * 1000) : 60000,
      };
    }
    if (message.includes('JSON') || err instanceof SyntaxError) {
      return { kind: 'parse', message: 'AI returned malformed response' };
    }
    return { kind: 'unknown', message };
  }
}

/** Type guard — true when generateJSON returned an error envelope. */
export function isGeminiError(value: unknown): value is GeminiError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'kind' in value &&
    'message' in value &&
    typeof (value as GeminiError).kind === 'string'
  );
}
