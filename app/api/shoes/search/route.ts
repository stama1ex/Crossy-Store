// app/api/shoes/search/route.ts

import { prisma } from '@/prisma/prisma-client';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('query')?.trim() || '';

  try {
    const shoes = await prisma.shoe.findMany({
      where: {
        OR: [
          {
            model: {
              name: {
                contains: query,
                mode: 'insensitive',
              },
            },
          },
          {
            model: {
              brand: {
                name: {
                  contains: query,
                  mode: 'insensitive',
                },
              },
            },
          },
          {
            description: {
              contains: query,
              mode: 'insensitive',
            },
          },
        ],
      },
      take: 10,
      include: {
        model: {
          include: {
            brand: true,
          },
        },
      },
    });

    return NextResponse.json(shoes);
  } catch (error) {
    console.error('❌ Failed to fetch shoes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shoes' },
      { status: 500 }
    );
  }
}
