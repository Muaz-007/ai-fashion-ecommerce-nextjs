import { NextRequest, NextResponse } from 'next/server';
import {
  getPersonalizedRecommendations,
  getSimilarProducts,
  getFrequentlyBoughtTogether,
  getTrendingProducts,
} from '@/lib/recommendations';
import { getSession } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get('type') || 'personal';
  const productId = Number(req.nextUrl.searchParams.get('productId') || 0);
  const limit = Math.min(20, Number(req.nextUrl.searchParams.get('limit') || 4));

  const session = await getSession();
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('guest_session')?.value ?? null;

  if (type === 'personal') {
    const result = await getPersonalizedRecommendations(
      session?.userId ?? null,
      sessionId,
      limit
    );
    return NextResponse.json({ success: true, data: result });
  }

  if (type === 'similar' && productId) {
    const products = await getSimilarProducts(productId, limit);
    return NextResponse.json({ success: true, data: { products } });
  }

  if (type === 'frequently_bought' && productId) {
    const products = await getFrequentlyBoughtTogether(productId, limit);
    return NextResponse.json({ success: true, data: { products } });
  }

  if (type === 'trending') {
    const products = await getTrendingProducts(limit);
    return NextResponse.json({ success: true, data: { products } });
  }

  return NextResponse.json(
    { success: false, message: 'Invalid type' },
    { status: 400 }
  );
}
