// app/cart/page.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useCartStore } from '@/store/cart';
import { ShoeCardType } from '@/components/shared/types';
import AuthGuard from '@/components/auth/auth-guard';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { message } from 'antd';
import { CartItem as PrismaCartItem } from '@prisma/client';
import { capitalizeWords } from '@/lib/utils';

interface CartItem extends PrismaCartItem {
  shoe?: ShoeCardType;
}

export default function CartPage() {
  const { data: session } = useSession();
  const [messageApi, contextHolder] = message.useMessage();
  const {
    items,
    isCartLoading,
    setCartItems,
    loadCachedCart,
    removeFromCart,
    clearCart,
  } = useCartStore();
  const [shoes, setShoes] = useState<ShoeCardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [removeLoading, setRemoveLoading] = useState<number | null>(null);
  const [clearLoading, setClearLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (session?.user?.id) {
          await loadCachedCart(Number(session.user.id));
        }

        const shoesRes = await fetch('/api/shoes', { cache: 'no-store' });
        if (!shoesRes.ok) {
          const errorText = await shoesRes.text();
          throw new Error(
            `Failed to fetch shoes: ${shoesRes.status} ${errorText || ''}`
          );
        }
        const shoesData = await shoesRes.json();
        setShoes(shoesData);

        if (session?.user?.id) {
          const cartRes = await fetch('/api/cart', { cache: 'no-store' });
          if (!cartRes.ok) {
            const errorText = await cartRes.text();
            if (cartRes.status === 401) {
              setCartItems([], Number(session.user.id));
              return;
            }
            throw new Error(
              `Failed to fetch cart: ${cartRes.status} ${errorText || ''}`
            );
          }
          const cartData = await cartRes.json();
          setCartItems(cartData.items || [], Number(session.user.id));
        }
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        console.error('Failed to fetch data:', {
          error,
          message: errorMessage,
        });
        messageApi.error(errorMessage || 'Failed to load cart');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [session, setCartItems, loadCachedCart, messageApi]);

  const handleRemoveFromCart = async (id: number) => {
    setRemoveLoading(id);
    try {
      await removeFromCart(
        id,
        session?.user?.id ? Number(session.user.id) : undefined
      );
      messageApi.success('Item removed from cart');
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to remove item:', { error, message: errorMessage });
      messageApi.error(errorMessage || 'Failed to remove item from cart');
    } finally {
      setRemoveLoading(null);
    }
  };

  const handleClearCart = async () => {
    setClearLoading(true);
    try {
      await clearCart(session?.user?.id ? Number(session.user.id) : undefined);
      messageApi.success('Cart cleared');
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to clear cart:', { error, message: errorMessage });
      messageApi.error(errorMessage || 'Failed to clear cart');
    } finally {
      setClearLoading(false);
    }
  };

  const cartItemsWithDetails: CartItem[] = items.map((item) => {
    const shoe = item.shoe || shoes.find((s) => s.id === item.shoeId);
    return { ...item, shoe };
  });

  const totalPrice = cartItemsWithDetails.reduce((sum, item) => {
    if (!item.shoe) return sum;
    return sum + item.shoe.price * item.quantity;
  }, 0);

  if (!session) {
    return (
      <AuthGuard>
        <div className="min-h-svh bg-muted/30 p-6 md:p-10">
          <p className="text-center text-muted-foreground">
            Please log in to view your cart.
          </p>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-svh bg-muted/30 p-6 md:p-10">
        {contextHolder}
        <div className="mx-auto max-w-3xl flex flex-col gap-6">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Your Cart</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {loading || isCartLoading ? (
                <div className="flex justify-center items-center">
                  <span className="loading loading-bars loading-md text-primary" />
                </div>
              ) : cartItemsWithDetails.length === 0 ? (
                <p className="text-center text-muted-foreground">
                  Your cart is empty.
                </p>
              ) : (
                cartItemsWithDetails.map(
                  ({ id, shoe, size, quantity, shoeId }) => (
                    <div
                      key={id}
                      className="flex items-center justify-between gap-4 rounded-lg border p-3"
                    >
                      {shoe ? (
                        <Link
                          href={`/shoe/${shoeId}`}
                          className="flex items-center gap-4 flex-1"
                        >
                          <Image
                            src={shoe.imageURL}
                            alt={shoe.model.name}
                            width={64}
                            height={64}
                            className="rounded-md object-cover"
                            priority={cartItemsWithDetails.length <= 3}
                          />
                          <div>
                            <p className="font-medium hover:underline">
                              {capitalizeWords(shoe.model.name)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Size: {size} · Qty: {quantity}
                            </p>
                            <p className="text-sm text-foreground">
                              ${shoe.price.toFixed(2)}
                            </p>
                          </div>
                        </Link>
                      ) : (
                        <p className="text-destructive text-sm flex-1">
                          Shoe not found
                        </p>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveFromCart(id)}
                        disabled={removeLoading === id}
                        aria-busy={removeLoading === id}
                      >
                        {removeLoading === id ? (
                          <span className="loading loading-bars loading-sm text-primary" />
                        ) : (
                          <Trash2 className="size-4 text-destructive" />
                        )}
                      </Button>
                    </div>
                  )
                )
              )}
              {cartItemsWithDetails.length > 0 && (
                <div className="mt-4 flex flex-col gap-4 border-t pt-4">
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex flex-col gap-4 w-full">
                      <Link href="/checkout">
                        <Button
                          className="w-full"
                          disabled={clearLoading}
                          aria-busy={clearLoading}
                        >
                          {clearLoading ? (
                            <div className="flex items-center gap-2">
                              <span className="loading loading-bars loading-md text-primary" />
                              Processing...
                            </div>
                          ) : (
                            'Proceed to Checkout'
                          )}
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={handleClearCart}
                        disabled={clearLoading}
                        aria-busy={clearLoading}
                      >
                        {clearLoading ? (
                          <div className="flex items-center gap-2">
                            <span className="loading loading-bars loading-sm text-primary" />
                            Clearing...
                          </div>
                        ) : (
                          'Clear Cart'
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  );
}
