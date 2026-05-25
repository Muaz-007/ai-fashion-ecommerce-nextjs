import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { trackActivity } from '@/lib/recommendations';
import { getSession } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      sizes: true,
      colors: true,
      badges: true,
      tags: true,
    },
  });

  if (!product || !product.isActive) {
    return NextResponse.json(
      { success: false, message: 'Product not found' },
      { status: 404 }
    );
  }

  // Track view
  await prisma.product.update({
    where: { id: product.id },
    data: { viewCount: { increment: 1 } },
  });

  const session = await getSession();
  const cookieStore = await cookies();
  let sessionId = cookieStore.get('guest_session')?.value;
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    cookieStore.set('guest_session', sessionId, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });
  }
  await trackActivity(product.id, 'view', session?.userId ?? null, session ? null : sessionId);

  return NextResponse.json({ success: true, data: { product } });
}
