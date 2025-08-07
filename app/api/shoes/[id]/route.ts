import { prisma } from '@/prisma/prisma-client';
import { NextResponse } from 'next/server';
import { ShoeCardWithFavorites } from '@/components/shared/types';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> } // Updated to Promise
) {
  try {
    const params = await context.params; // Await params
    const shoeId = Number(params.id);
    if (isNaN(shoeId)) {
      console.warn('Invalid shoe ID', { id: params.id });
      return NextResponse.json({ error: 'Invalid shoe ID' }, { status: 400 });
    }

    const shoe = await prisma.shoe.findUnique({
      where: { id: shoeId },
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
        favorites: { select: { id: true, userId: true, shoeId: true } }, // Include userId and shoeId
      },
    });

    if (!shoe) {
      console.warn('Shoe not found', { id: shoeId });
      return NextResponse.json({ error: 'Shoe not found' }, { status: 404 });
    }

    // Map to ShoeCardWithFavorites
    const response: ShoeCardWithFavorites = {
      id: shoe.id,
      imageURL: shoe.imageURL || '',
      price: shoe.price,
      description: shoe.description ?? undefined,
      color: shoe.color || 'NEUTRAL',
      gender: shoe.gender || 'UNISEX',
      model: {
        name: shoe.model.name,
        brand: { name: shoe.model.brand.name },
      },
      favorites: shoe.favorites || [],
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error('Error fetching shoe:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: 'Failed to fetch shoe' },
      { status: 500 }
    );
  }
}
