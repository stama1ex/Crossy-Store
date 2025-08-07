import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/prisma/prisma-client';
import { revalidateTag } from 'next/cache';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.warn('Unauthorized toggle attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    console.log('Toggle favorite API called with body:', body);

    const { shoeId } = body;

    if (typeof shoeId !== 'number' || isNaN(shoeId) || shoeId <= 0) {
      console.warn('Invalid shoeId received:', shoeId);
      return NextResponse.json({ error: 'Invalid shoeId' }, { status: 400 });
    }

    const userId = Number(session.user.id);

    const shoe = await prisma.shoe.findUnique({ where: { id: shoeId } });
    if (!shoe) {
      console.warn(`Shoe not found for id: ${shoeId}`);
      return NextResponse.json({ error: 'Shoe not found' }, { status: 404 });
    }

    const [existing, totalFavorites] = await prisma.$transaction([
      prisma.favorite.findFirst({ where: { shoeId, userId } }),
      prisma.favorite.count({ where: { shoeId } }),
    ]);

    if (existing) {
      console.log(
        `Removing favorite id ${existing.id} for user ${userId}, shoe ${shoeId}`
      );
      await prisma.favorite.delete({ where: { id: existing.id } });
    } else {
      console.log(`Creating favorite for user ${userId}, shoe ${shoeId}`);
      await prisma.favorite.create({ data: { shoeId, userId } });
    }

    const updatedFavorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        shoe: {
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
                brand: {
                  select: { name: true },
                },
              },
            },
          },
        },
      },
    });

    const likeCounts: Record<number, number> = {};
    likeCounts[shoeId] = existing ? totalFavorites - 1 : totalFavorites + 1;

    // Инвалидация кешей
    await Promise.all([
      revalidateTag(`favorites-${userId}`),
      revalidateTag(`shoe-${shoeId}`),
    ]);

    console.log('Toggle favorite succeeded', { userId, shoeId, likeCounts });
    return NextResponse.json({ favorites: updatedFavorites, likeCounts });
  } catch (error) {
    console.error('Toggle favorite error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error,
    });
    return NextResponse.json(
      {
        error: 'Failed to toggle favorite',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
