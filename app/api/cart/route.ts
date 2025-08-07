// app/api/cart/route.ts
import { prisma } from '@/prisma/prisma-client';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = Number(session.user.id);
  const body = await request.json();
  const { shoeId, size, quantity = 1 } = body;

  if (!shoeId || !size) {
    return NextResponse.json(
      { error: 'Missing shoeId or size' },
      { status: 400 }
    );
  }

  try {
    let cart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    }

    const existingItem = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, shoeId, size },
    });

    let cartItem;
    if (existingItem) {
      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
        select: {
          id: true,
          shoeId: true,
          cartId: true,
          size: true,
          quantity: true,
          createdAt: true,
          updatedAt: true,
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
    } else {
      cartItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          shoeId,
          size,
          quantity,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        select: {
          id: true,
          shoeId: true,
          cartId: true,
          size: true,
          quantity: true,
          createdAt: true,
          updatedAt: true,
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
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { cartId: cart.id },
      select: {
        id: true,
        shoeId: true,
        cartId: true,
        size: true,
        quantity: true,
        createdAt: true,
        updatedAt: true,
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

    revalidateTag(`cart-${userId}`);
    return NextResponse.json({ items: cartItems }, { status: 200 });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Cart API POST error:', { error, message: errorMessage });
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = Number(session.user.id);
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          select: {
            id: true,
            shoeId: true,
            cartId: true,
            size: true,
            quantity: true,
            createdAt: true,
            updatedAt: true,
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
        },
      },
    });

    return NextResponse.json({ items: cart?.items || [] });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cart' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = Number(session.user.id);
    const { itemId, quantity } = await request.json();

    if (!itemId || typeof quantity !== 'number' || quantity < 1) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const cart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
    }

    const cartItem = await prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
    });

    if (!cartItem) {
      return NextResponse.json(
        { error: 'Cart item not found' },
        { status: 404 }
      );
    }

    const updatedCartItem = await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity, updatedAt: new Date() },
      select: {
        id: true,
        shoeId: true,
        cartId: true,
        size: true,
        quantity: true,
        createdAt: true,
        updatedAt: true,
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

    const cartItems = await prisma.cartItem.findMany({
      where: { cartId: cart.id },
      select: {
        id: true,
        shoeId: true,
        cartId: true,
        size: true,
        quantity: true,
        createdAt: true,
        updatedAt: true,
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

    revalidateTag(`cart-${userId}`);
    return NextResponse.json({ items: cartItems }, { status: 200 });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Cart API PUT error:', { error, message: errorMessage });
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
