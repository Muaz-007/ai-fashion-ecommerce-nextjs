import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const Schema = z.object({ email: z.string().email() });

export async function POST(req: NextRequest) {
  try {
    const { email } = Schema.parse(await req.json());

    await prisma.newsletterSubscriber.upsert({
      where: { email },
      create: { email },
      update: { isActive: true },
    });

    return NextResponse.json({
      success: true,
      message: 'Welcome to the Aurelle Atelier',
    });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Invalid email address' },
      { status: 422 }
    );
  }
}
