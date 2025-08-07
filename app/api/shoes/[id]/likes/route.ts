import { prisma } from '@/prisma/prisma-client';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ shoeId: string }> }
) {
  try {
    const { shoeId } = await params;
    const parsedShoeId = Number(shoeId);

    if (isNaN(parsedShoeId) || parsedShoeId <= 0) {
      return NextResponse.json({ error: 'Invalid shoe ID' }, { status: 400 });
    }

    const likeCount = await prisma.favorite.count({
      where: { shoeId: parsedShoeId },
    });

    return NextResponse.json({ likeCount });
  } catch (error) {
    console.error('Error fetching like count:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      shoeId: (await params).shoeId,
    });
    return NextResponse.json(
      { error: 'Failed to fetch like count' },
      { status: 500 }
    );
  }
}
