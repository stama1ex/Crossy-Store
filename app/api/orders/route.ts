import { prisma } from '@/prisma/prisma-client';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { revalidateTag } from 'next/cache';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
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
          include: {
            shoe: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    const totalPrice = cart.items.reduce(
      (sum, item) => sum + item.quantity * item.shoe.price,
      0
    );

    const order = await prisma.order.create({
      data: {
        userId,
        totalPrice,
        status: 'SUCCEEDED', // Changed from 'PENDING' to 'SUCCEEDED'
        items: {
          create: cart.items.map((item) => ({
            shoeId: item.shoeId,
            size: item.size,
            quantity: item.quantity,
            price: item.shoe.price,
          })),
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Clear cart after order creation
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    revalidateTag(`cart-${userId}`);
    return NextResponse.json({ orderId: order.id, message: 'Order created' });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = Number(session.user.id);
    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            shoe: {
              select: {
                id: true,
                model: { select: { name: true } },
                imageURL: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Ensure totalPrice and item.price are numbers
    const formattedOrders = orders.map((order) => ({
      ...order,
      totalPrice: Number(order.totalPrice),
      items: order.items.map((item) => ({
        ...item,
        price: Number(item.price),
      })),
    }));

    return NextResponse.json(formattedOrders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
