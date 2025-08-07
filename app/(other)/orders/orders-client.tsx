'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { message } from 'antd';
import { Button } from '@/components/ui';
import { Package, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { capitalizeWords } from '@/lib/utils';
import { format } from 'date-fns';

interface OrderItem {
  shoeId: number;
  size: string;
  quantity: number;
  price: number;
  shoe?: {
    model: { name: string };
    imageURL: string;
  };
}

interface Order {
  id: number;
  totalPrice: number | string | null;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

interface Props {
  initialOrders: Order[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  session: any; // Use 'any' to match original code; ideally, use Session from next-auth
}

const OrdersClient: React.FC<Props> = ({ initialOrders, session }) => {
  const { data: sessionData, status } = useSession();
  const [messageApi, contextHolder] = message.useMessage();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      messageApi.error('Please log in to view your orders');
      setTimeout(() => router.push('/'), 2000);
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/orders', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch orders');
        }

        const data = await response.json();
        console.log('Fetched orders:', data);
        setOrders(data);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        console.error('Failed to fetch orders:', error);
        messageApi.error(errorMessage || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated' && !initialOrders.length) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [status, messageApi, router, initialOrders]);

  const formatTotalPrice = (totalPrice: number | string | null): string => {
    if (totalPrice == null) return '0.00';
    const num =
      typeof totalPrice === 'string' ? parseFloat(totalPrice) : totalPrice;
    return isNaN(num) ? '0.00' : num.toFixed(2);
  };

  return (
    <>
      {contextHolder}
      {loading ? (
        <div className="flex justify-center items-center min-h-[60vh]">
          <span className="loading loading-bars loading-xl" />
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <Package className="w-16 h-16 text-muted-foreground mb-4 md:mb-6" />
          <p className="text-base md:text-lg text-muted-foreground mb-6">
            You have no orders yet.
          </p>
          <Button
            asChild
            className="h-12 rounded-lg text-base font-bold group w-full max-w-md bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Link href="/">
              Start Shopping
              <ArrowRight className="w-5 ml-2 group-hover:translate-x-2 transition" />
            </Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="border border-border rounded-lg p-4 sm:p-6 bg-card text-card-foreground shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
                <div>
                  <p className="text-base md:text-lg font-medium text-foreground">
                    Order #{order.id}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Placed on: {format(new Date(order.createdAt), 'PPp')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Status: {order.status}
                  </p>
                </div>
                <div className="flex flex-col sm:items-end">
                  <p className="text-base md:text-lg font-medium text-foreground">
                    Total: ${formatTotalPrice(order.totalPrice)}
                  </p>
                  <Button
                    asChild
                    variant="outline"
                    className="h-10 rounded-lg text-sm font-bold mt-2 w-full sm:w-auto border-border text-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    <Link
                      href={`/order?orderId=${order.id}&total=${formatTotalPrice(order.totalPrice)}`}
                    >
                      View Details
                      <ArrowRight className="w-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 border-t border-border pt-4 first:border-t-0"
                  >
                    {item.shoe ? (
                      <>
                        <Link href={`/shoe/${item.shoeId}`}>
                          <img
                            src={item.shoe.imageURL}
                            alt={`${item.shoe.model.name} sneaker`}
                            className="w-16 h-16 rounded-md object-cover"
                          />
                        </Link>
                        <div className="flex-1">
                          <p className="text-sm md:text-base font-medium text-foreground">
                            {capitalizeWords(item.shoe.model.name)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Size: {item.size} · Quantity: {item.quantity} · $
                            {formatTotalPrice(item.price)}
                          </p>
                        </div>
                      </>
                    ) : (
                      <p className="text-destructive text-sm">
                        Item details unavailable
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default OrdersClient;
