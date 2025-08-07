'use client';

import { Button } from '@/components/ui/button';
import { useCartStore, CartItem } from '@/store/cart';
import { ShoppingCart, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';

interface Props {
  className?: string;
  onClick?: () => void;
  isLoading?: boolean;
}

export const CartButton: React.FC<Props> = ({
  className,
  onClick,
  isLoading,
}) => {
  // Select only the items from the store
  const items = useCartStore((state) => state.items);

  // Memoize totalItems and totalPrice to avoid recalculation
  const { totalItems, totalPrice } = useMemo(() => {
    const totalItems = items.reduce(
      (sum: number, item: CartItem) => sum + item.quantity,
      0
    );
    const totalPrice = items.reduce(
      (sum: number, item: CartItem) =>
        sum + (item.shoe?.price || 0) * item.quantity,
      0
    );
    return {
      totalItems,
      totalPrice: isNaN(totalPrice) ? 0 : totalPrice,
    };
  }, [items]);

  // Format price to two decimal places
  const formatPrice = (price: number): string => {
    return price.toFixed(2);
  };

  return (
    <Link href="/cart">
      <Button
        className={`group relative text-base py-2 bg-primary text-primary-foreground hover:bg-primary/90 ${className}`}
        onClick={onClick}
        disabled={isLoading}
      >
        <b>${formatPrice(totalPrice)}</b>
        <span className="h-full w-[1px] bg-secondary mx-1" />
        <div className="flex items-center gap-1 transition duration-300 group-hover:opacity-0 opacity-100">
          <ShoppingCart
            size={16}
            className="relative sm:w-4 sm-h-4"
            strokeWidth={2}
          />
          <b>{totalItems}</b>
        </div>
        <ArrowRight
          className="w-5 absolute right-5 transition duration-300 -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0"
          size={16}
        />
        {isLoading && (
          <span className="loading loading-spinner loading-sm text-primary-foreground ml-2" />
        )}
      </Button>
    </Link>
  );
};
