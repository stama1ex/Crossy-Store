'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { message } from 'antd';
import { Button } from '@/components/ui';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface OrderClientProps {
  orderId?: string;
  total?: string;
}

export default function OrderClient({ orderId, total }: OrderClientProps) {
  const [messageApi, contextHolder] = message.useMessage();
  const router = useRouter();

  useEffect(() => {
    if (!orderId) {
      messageApi.error('No order ID provided. Redirecting to homepage...');
      setTimeout(() => router.push('/'), 2000);
    }
  }, [orderId, messageApi, router]);

  return (
    <>
      {contextHolder}
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mb-4 md:mb-6" />
        <div className="flex flex-col gap-3 max-w-md mb-6 md:mb-8">
          <p className="text-base md:text-lg text-muted-foreground">
            Thank you for your purchase! Your order has been successfully
            placed.
          </p>
          {orderId && (
            <p className="text-sm md:text-base text-muted-foreground">
              <span className="font-medium">Order ID:</span> {orderId}
            </p>
          )}
          {total && (
            <p className="text-sm md:text-base text-muted-foreground">
              <span className="font-medium">Total:</span> ${total}
            </p>
          )}
          <p className="text-sm md:text-base text-muted-foreground">
            You will receive a confirmation email with the order details soon.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
          <Button
            asChild
            variant="outline"
            className="h-12 rounded-2xl text-base font-bold flex-1"
          >
            <Link href="/orders">
              <Package className="w-5 mr-2" />
              View Orders
            </Link>
          </Button>
          <Button
            asChild
            className="h-12 rounded-2xl text-base font-bold group flex-1"
          >
            <Link href="/">
              Continue Shopping
              <ArrowRight className="w-5 ml-2 group-hover:translate-x-2 transition" />
            </Link>
          </Button>
        </div>
      </div>
    </>
  );
}
