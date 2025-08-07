import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma/prisma-client';

export async function POST(request: NextRequest) {
  try {
    await prisma.verificationCode.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });

    return NextResponse.json({
      message: 'Expired verification codes deleted',
    });
  } catch (error) {
    console.error('❌ Cleanup verification API error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
