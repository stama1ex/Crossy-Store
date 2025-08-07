import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/prisma/prisma-client';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    console.time('batchFavorites');
    const session = await getServerSession(authOptions);
    console.log('Session:', session);
    if (!session?.user?.id) {
      console.log('Unauthorized access');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, pendingFavorites } = await req.json();
    console.log('Request body:', { userId, pendingFavorites });

    if (typeof userId !== 'number' || isNaN(userId)) {
      console.log('Invalid userId:', userId);
      return NextResponse.json({ error: 'Invalid userId' }, { status: 400 });
    }
    if (!pendingFavorites || typeof pendingFavorites !== 'object') {
      console.log('Invalid pendingFavorites:', pendingFavorites);
      return NextResponse.json(
        { error: 'Invalid pendingFavorites' },
        { status: 400 }
      );
    }
    if (Number(session.user.id) !== userId) {
      console.log('User ID mismatch:', {
        sessionUserId: session.user.id,
        userId,
      });
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Verify user exists
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    if (!userExists) {
      console.log('User not found:', { userId });
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const shoeIds = Object.keys(pendingFavorites)
      .map(Number)
      .filter((id) => !isNaN(id) && id > 0);
    if (shoeIds.length === 0) {
      console.log('No valid shoe IDs to process');
      return NextResponse.json({ favorites: [], likeCounts: {} });
    }

    // Validate shoes
    const shoes = await prisma.shoe.findMany({
      where: { id: { in: shoeIds } },
      select: { id: true },
    });
    const validShoeIds = shoes.map((shoe) => shoe.id);
    const invalidShoeIds = shoeIds.filter((id) => !validShoeIds.includes(id));
    if (invalidShoeIds.length > 0) {
      console.log(`Invalid shoe IDs: ${invalidShoeIds}`);
      return NextResponse.json(
        { error: `Invalid shoe IDs: ${invalidShoeIds}` },
        { status: 404 }
      );
    }

    // Process batch updates in a transaction
    const favorites = await prisma.$transaction(async (tx) => {
      const currentFavorites = await tx.favorite.findMany({
        where: { userId, shoeId: { in: shoeIds } },
      });

      const toAdd: number[] = [];
      const toRemove: number[] = [];
      for (const shoeId of shoeIds) {
        const shouldBeFavorite = pendingFavorites[shoeId];
        if (typeof shouldBeFavorite !== 'boolean') {
          console.log(
            `Invalid pendingFavorite value for shoeId ${shoeId}:`,
            shouldBeFavorite
          );
          throw new Error(`Invalid pendingFavorite value for shoeId ${shoeId}`);
        }
        const isCurrentlyFavorite = currentFavorites.some(
          (fav) => fav.shoeId === shoeId
        );
        if (shouldBeFavorite && !isCurrentlyFavorite) {
          toAdd.push(shoeId);
        } else if (!shouldBeFavorite && isCurrentlyFavorite) {
          toRemove.push(shoeId);
        }
      }

      // Remove favorites
      if (toRemove.length > 0) {
        await tx.favorite.deleteMany({
          where: { userId, shoeId: { in: toRemove } },
        });
        console.log('Removed favorites:', toRemove);
      }

      // Add favorites
      if (toAdd.length > 0) {
        const existingFavorites = await tx.favorite.findMany({
          where: { userId, shoeId: { in: toAdd } },
          select: { shoeId: true },
        });
        const existingShoeIds = new Set(
          existingFavorites.map((fav) => fav.shoeId)
        );
        const filteredToAdd = toAdd.filter(
          (shoeId) => !existingShoeIds.has(shoeId)
        );
        if (filteredToAdd.length > 0) {
          await tx.favorite.createMany({
            data: filteredToAdd.map((shoeId) => ({ userId, shoeId })),
          });
          console.log('Added favorites:', filteredToAdd);
        }
      }

      // Get updated favorites
      const updatedFavorites = await tx.favorite.findMany({
        where: { userId },
      });

      // Get total favorites for each shoe
      const likeCounts: Record<number, number> = {};
      for (const shoeId of shoeIds) {
        const count = await tx.favorite.count({ where: { shoeId } });
        likeCounts[shoeId] = count;
      }

      return { favorites: updatedFavorites, likeCounts };
    });

    console.timeEnd('batchFavorites');
    return NextResponse.json(favorites);
  } catch (error) {
    console.error('Batch favorites error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      code: error instanceof Error && 'code' in error ? error.code : undefined,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      {
        error: 'Failed to process batch favorites',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
