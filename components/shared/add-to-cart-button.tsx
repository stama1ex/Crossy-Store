'use client';

import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cart';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation'; // Import useRouter for redirection
import { message } from 'antd';

interface Props {
  shoeId: number;
}

export default function AddToCartButton({ shoeId }: Props) {
  const [messageApi, contextHolder] = message.useMessage();
  const { data: session } = useSession();
  const { addToCart } = useCartStore();
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter(); // Initialize router

  const sizes = Array.from({ length: 10 }, (_, i) => 36 + i); // Sizes 36 to 45

  const handleAddToCart = async () => {
    // Check if user is not logged in
    if (!session?.user?.id) {
      messageApi.info('Please log in to add items to your cart');
      router.push('/login'); // Redirect to login page
      return;
    }

    if (!selectedSize) {
      messageApi.error('Please select a size');
      return;
    }

    setIsLoading(true);
    try {
      await addToCart(
        shoeId,
        selectedSize,
        session?.user?.id ? Number(session.user.id) : undefined
      );
      messageApi.success('Added to cart!');
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.error('Add to cart error:', { error, message: errorMessage });
      messageApi.error(errorMessage || 'Failed to add to cart');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {contextHolder}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => (
            <Button
              key={size}
              variant={selectedSize === size ? 'default' : 'outline'}
              className={`w-12 h-10 ${selectedSize === size ? 'bg-primary text-primary-foreground' : ''}`}
              onClick={() => setSelectedSize(size)}
              disabled={isLoading}
            >
              {size}
            </Button>
          ))}
        </div>
        <Button
          onClick={handleAddToCart}
          disabled={!selectedSize || isLoading}
          className="w-full"
          aria-busy={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <span className="loading loading-bars loading-sm" />
              Adding...
            </div>
          ) : (
            'Add to Cart'
          )}
        </Button>
      </div>
    </>
  );
}
