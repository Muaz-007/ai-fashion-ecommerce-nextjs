import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();

  return NextResponse.json(
    {
      success: true,
      data: { user, authenticated: !!user },
    },
    {
      headers: {
        // Browser caches for 5s — debounces rapid navigation
        // `private` so CDNs / shared caches never see it (user-specific)
        'Cache-Control': 'private, max-age=5',
      },
    }
  );
}
