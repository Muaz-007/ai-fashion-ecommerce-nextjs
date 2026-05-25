import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

const Schema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = Schema.parse(await req.json());
    await prisma.user.update({
      where: { id: session.userId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || null,
      },
    });
    return NextResponse.json({ success: true, message: 'Profile updated' });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Invalid input' },
      { status: 422 }
    );
  }
}
