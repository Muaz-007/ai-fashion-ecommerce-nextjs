import { NextRequest, NextResponse } from 'next/server';
import { smartSearch } from '@/lib/recommendations';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() ?? '';
  const limit = Math.min(50, Number(req.nextUrl.searchParams.get('limit') || 20));

  if (q.length < 2) {
    return NextResponse.json(
      { success: false, message: 'Search query too short' },
      { status: 422 }
    );
  }

  const result = await smartSearch(q, limit);
  return NextResponse.json({
    success: true,
    data: {
      query: q,
      expandedQuery: result.expandedQuery,
      products: result.products,
      count: result.count,
      engine: 'typescript_smart_search',
    },
  });
}
