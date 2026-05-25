import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession, hashPassword, verifyPassword } from '@/lib/auth';

const Schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { currentPassword, newPassword } = Schema.parse(await req.json());

    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    const valid = await verifyPassword(currentPassword, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { success: false, message: 'Current password is incorrect' },
        { status: 401 }
      );
    }

    await prisma.user.update({
      where: { id: session.userId },
      data: { passwordHash: await hashPassword(newPassword) },
    });

    return NextResponse.json({ success: true, message: 'Password updated' });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Invalid input' },
      { status: 422 }
    );
  }
}
