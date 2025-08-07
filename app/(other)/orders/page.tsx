import { Metadata } from 'next';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/prisma/prisma-client';
import { Container, Title } from '@/components/shared';
import OrdersClient from './orders-client';
import { Order, OrderItem } from '@/components/shared/types';
import { authOptions } from '@/lib/auth';

export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Your Orders | Crossy',
  description:
    'View your order history at Crossy, including order details and status for your sneaker purchases.',
  keywords: ['orders', 'order history', 'sneakers', 'crossy', 'purchases'],
  robots: {
    index: false,
    follow: false,
  },
};

async function fetchOrders(userId?: number): Promise<Order[]> {
  if (!userId) return [];

  try {
    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            shoe: {
              include: {
                model: true,
              },
            },
          },
        },
      },
    });

    return orders.map((order) => ({
      id: order.id,
      totalPrice: Number(order.totalPrice), // Convert Decimal to number
      status: order.status,
      createdAt: order.createdAt.toISOString(),
      items: order.items.map((item) => ({
        shoeId: item.shoeId,
        size: item.size.toString(),
        quantity: item.quantity,
        price: Number(item.price), // Convert Decimal to number
        shoe: item.shoe
          ? {
              model: { name: item.shoe.model.name },
              imageURL: item.shoe.imageURL,
            }
          : undefined,
      })),
    }));
  } catch (error) {
    console.error('❌ Server error fetching orders:', error);
    return [];
  }
}

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ? Number(session.user.id) : undefined;

  // Fetch initial orders
  const initialOrders = await fetchOrders(userId);

  // JSON-LD Schema for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        name: 'Crossy',
        url: 'https://your-store-name.com',
        logo: 'https://your-store-name.com/images/logo.png',
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://your-store-name.com',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Orders',
            item: 'https://your-store-name.com/orders',
          },
        ],
      },
    ],
  };

  return (
    <Container className="mt-6 mb-12 md:mt-10 px-4 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Title
        text="Your Orders"
        size="lg"
        className="font-extrabold mb-6 md:mb-8 text-2xl md:text-3xl text-foreground"
      />
      <OrdersClient initialOrders={initialOrders} session={session} />
    </Container>
  );
}
