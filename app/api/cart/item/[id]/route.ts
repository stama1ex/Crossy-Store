import { prisma } from '@/prisma/prisma-client';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> } // Updated to Promise
) {
  try {
    const params = await context.params; // Await params
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.warn('Unauthorized access attempt to /api/cart/item/[id]', {
        id: params.id,
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: Number(params.id) },
      select: { cart: { select: { userId: true } } },
    });

    if (!cartItem || cartItem.cart.userId !== Number(session.user.id)) {
      console.warn('Cart item not found or unauthorized', { id: params.id });
      return NextResponse.json(
        { error: 'Cart item not found or unauthorized' },
        { status: 404 }
      );
    }

    await prisma.cartItem.delete({
      where: { id: Number(params.id) },
    });

    return NextResponse.json({ message: 'Item removed from cart' });
  } catch (error: unknown) {
    console.error('Error removing item from cart:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: 'Failed to remove item from cart' },
      { status: 500 }
    );
  }
}
