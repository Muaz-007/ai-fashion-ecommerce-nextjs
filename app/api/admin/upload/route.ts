// ============================================
// POST /api/admin/upload — image upload endpoint
// Admin-only. Accepts multipart/form-data with `file` field.
// Returns { url } pointing to the publicly-served image.
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { saveImage } from '@/lib/storage';

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, message: 'No file provided' },
        { status: 422 }
      );
    }

    const result = await saveImage(file);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Upload failed';
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}

// Allow uploads up to 10MB (storage layer enforces 5MB but route should accept generously)
export const config = {
  api: {
    bodyParser: false,
  },
};
