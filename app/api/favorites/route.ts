import { prisma } from '@/prisma/prisma-client';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    console.time('getFavorites');
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.log('Unauthorized access');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = Number(session.user.id);
    console.log(`Fetching favorites for userId: ${userId}`);

    const favorites = await prisma.favorite.findMany({
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

    console.log(`Fetched ${favorites.length} favorites for userId: ${userId}`);
    console.timeEnd('getFavorites');

    return NextResponse.json(
      favorites.map((fav) => ({
        id: fav.id,
        shoeId: fav.shoeId,
        userId: fav.userId,
        shoe: fav.shoe,
      }))
    );
  } catch (error) {
    console.error('Get favorites error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch favorites' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  let userId: number | undefined;
  let shoeId: number | undefined;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json();
    const parsedShoeId = Number(body.shoeId);
    if (isNaN(parsedShoeId) || parsedShoeId <= 0) {
      return NextResponse.json({ error: 'Invalid shoeId' }, { status: 400 });
    }

    userId = Number(session.user.id);
    shoeId = parsedShoeId;
    console.log('Adding favorite:', { userId, shoeId });

    // Verify user exists
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    if (!userExists) {
      console.warn('User not found:', { userId });
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify shoe exists
    const shoeExists = await prisma.shoe.findUnique({
      where: { id: parsedShoeId },
      select: { id: true },
    });
    if (!shoeExists) {
      console.warn('Shoe not found:', { shoeId: parsedShoeId });
      return NextResponse.json({ error: 'Shoe not found' }, { status: 404 });
    }

    // Check for existing favorite
    const existingFavorite = await prisma.favorite.findFirst({
      where: { userId, shoeId: parsedShoeId },
    });

    if (existingFavorite) {
      console.log('Favorite already exists:', { id: existingFavorite.id });
      return NextResponse.json(existingFavorite, { status: 200 });
    }

    // Create favorite
    const favorite = await prisma.favorite.create({
      data: {
        userId,
        shoeId: parsedShoeId,
      },
      select: {
        id: true,
        shoeId: true,
        userId: true,
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
                brand: { select: { name: true } },
              },
            },
          },
        },
      },
    });

    console.log('Favorite created:', { id: favorite.id });
    return NextResponse.json(favorite, { status: 201 });
  } catch (error) {
    console.error('Error adding favorite:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      code: error instanceof Error && 'code' in error ? error.code : undefined,
      stack: error instanceof Error ? error.stack : undefined,
      userId,
      shoeId,
    });
    return NextResponse.json(
      {
        error: 'Failed to add favorite',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
