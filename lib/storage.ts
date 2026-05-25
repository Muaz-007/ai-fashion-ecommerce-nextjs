// ============================================
// Storage abstraction layer
//
// Currently saves to local filesystem (public/uploads/).
// For production deploys, swap `saveLocal` for Vercel Blob, S3, or Cloudinary:
//
//   import { put } from '@vercel/blob';
//   const blob = await put(filename, buffer, { access: 'public' });
//   return blob.url;
//
// The rest of the app only talks to `saveImage()` — storage backend is hidden.
// ============================================

import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'products');

const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export interface UploadResult {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
}

/**
 * Save an uploaded File to local storage.
 * Returns the publicly-served URL (e.g. /uploads/products/abc123.png).
 */
export async function saveImage(file: File): Promise<UploadResult> {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error(`Unsupported file type: ${file.type}. Use JPEG, PNG, WebP, or GIF.`);
  }

  if (file.size > MAX_BYTES) {
    throw new Error(`File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max 5MB.`);
  }

  // Ensure directory exists
  await mkdir(UPLOAD_DIR, { recursive: true });

  // Generate a stable, unguessable filename
  const ext = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'bin';
  const random = crypto.randomBytes(12).toString('hex');
  const filename = `${Date.now()}-${random}.${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, filename), buffer);

  return {
    url: `/uploads/products/${filename}`,
    filename,
    size: file.size,
    mimeType: file.type,
  };
}
