import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const Schema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  inquiryType: z.string().optional(),
  message: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const data = Schema.parse(await req.json());

    await prisma.contactInquiry.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        inquiryType: data.inquiryType,
        message: data.message,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Message received. We will respond within 24 hours.',
    });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Please complete all required fields' },
      { status: 422 }
    );
  }
}
