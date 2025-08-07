// api/shoes/route.ts
import { prisma } from '@/prisma/prisma-client';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const shoes = await prisma.shoe.findMany({
      select: {
        id: true,
        imageURL: true,
        price: true,
        description: true,
        color: true,
        gender: true,
        model: {
          select: {
            name: true,
            brand: { select: { name: true } },
          },
        },
      },
    });

    return NextResponse.json(shoes);
  } catch (error) {
    console.error('Error fetching shoes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shoes' },
      { status: 500 }
    );
  }
}
