import { Metadata } from 'next';
import OrderClient from './order-client';
import { Container, Title } from '@/components/shared';

// Define metadata for SEO
export const metadata: Metadata = {
  title: 'Order Confirmation | Crossy',
  description: 'View your order confirmation details at Crossy.',
  keywords: ['order', 'confirmation', 'purchase', 'e-commerce', 'shoes'],
  openGraph: {
    title: 'Order Confirmation | Crossy',
    description: 'Your order has been successfully placed at Crossy.',
    type: 'website',
  },
};

interface OrderPageProps {
  searchParams: Promise<{ orderId?: string; total?: string }>;
}

export default async function OrderPage({ searchParams }: OrderPageProps) {
  const { orderId, total } = await searchParams; // Await the searchParams Promise

  return (
    <Container className="mt-6 md:mt-10 px-4 sm:px-6">
      <Title
        text="Order Successfully Created!"
        size="lg"
        className="font-extrabold mb-6 md:mb-8 text-2xl md:text-3xl text-center"
      />
      <OrderClient orderId={orderId} total={total} />
    </Container>
  );
}
