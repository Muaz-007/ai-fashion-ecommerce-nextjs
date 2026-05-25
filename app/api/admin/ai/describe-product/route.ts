// ============================================
// POST /api/admin/ai/describe-product
// Admin uploads a product image; Gemini Vision returns
// suggested name, description, material, tags, category & price.
// Form pre-fills with the suggestion (admin can edit before save).
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { describeProductFromImage, isGeminiError } from '@/lib/ai/product-vision';
import { isGeminiEnabled } from '@/lib/ai/gemini';

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
  }

  if (!isGeminiEnabled) {
    return NextResponse.json(
      {
        success: false,
        message: 'AI is not configured. Set GEMINI_API_KEY in .env',
      },
      { status: 503 }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, message: 'No image provided' },
        { status: 422 }
      );
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, message: 'File must be an image' },
        { status: 422 }
      );
    }

    // Convert file → base64 for Gemini
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString('base64');

    const result = await describeProductFromImage(base64, file.type);

    if (isGeminiError(result)) {
      const status = result.kind === 'quota' ? 429 : 502;
      return NextResponse.json(
        {
          success: false,
          message: result.message,
          kind: result.kind,
          retryAfterMs: result.retryAfterMs,
        },
        { status }
      );
    }

    return NextResponse.json({ success: true, data: result });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'AI request failed';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
