'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cart';
import { message } from 'antd';
import { Block } from '@/components/shared/checkout/block';
import { CheckoutItemDetails } from '@/components/shared/checkout/item-details';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn, capitalizeWords } from '@/lib/utils';
import { ArrowRight, Package, Percent, Truck, Plus, Minus } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoeCardType } from '@/components/shared/types';
import { CartItem as PrismaCartItem } from '@prisma/client';
import { Session } from 'next-auth';

interface CartItem extends PrismaCartItem {
  shoe?: ShoeCardType;
}

interface Props {
  initialCartItems: CartItem[];
  shoes: ShoeCardType[];
  session: Session | null;
}

const CheckoutClient: React.FC<Props> = ({
  initialCartItems,
  shoes,
  session,
}) => {
  const { items, updateQuantity, isCartLoading, loadCachedCart } =
    useCartStore();
  const [messageApi, contextHolder] = message.useMessage();
  const [cartItems, setCartItems] = useState<CartItem[]>(initialCartItems);
  const [loading, setLoading] = useState(true);
  const [useAccountData, setUseAccountData] = useState(false);
  const [quantityLoading, setQuantityLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    comment: '',
  });
  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
  });
  const hasLoadedCart = useRef(false);
  const router = useRouter();

  // Sync client-side cart with initial server data
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (session?.user?.id && !hasLoadedCart.current) {
          await loadCachedCart(Number(session.user.id));
          hasLoadedCart.current = true;
        }
        setCartItems(items.length > 0 ? items : initialCartItems);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        console.error('Failed to sync cart:', error);
        messageApi.error(errorMessage || 'Failed to load cart');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [session, items, initialCartItems, loadCachedCart, messageApi]);

  const handleQuantityChange = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1 || quantityLoading) return;
    setQuantityLoading(true);
    try {
      await updateQuantity(
        itemId,
        newQuantity,
        session?.user?.id ? Number(session.user.id) : undefined
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to update quantity:', {
        error,
        message: errorMessage,
      });
      messageApi.error(errorMessage || 'Failed to update quantity');
    } finally {
      setQuantityLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setUseAccountData(checked);
    if (checked) {
      setErrors((prev) => ({
        ...prev,
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = {
      firstName:
        useAccountData || formData.firstName ? '' : 'First name is required',
      lastName:
        useAccountData || formData.lastName ? '' : 'Last name is required',
      email: useAccountData || formData.email ? '' : 'Email is required',
      phone: useAccountData || formData.phone ? '' : 'Phone is required',
      address: formData.address ? '' : 'Address is required',
    };
    setErrors(newErrors);

    if (Object.values(newErrors).some((error) => error)) {
      messageApi.error('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          userId: session?.user?.id ? Number(session.user.id) : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create order');
      }

      const { orderId } = await response.json();
      router.push(`/order?orderId=${orderId}&total=${totalPrice.toFixed(2)}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      messageApi.error(errorMessage || 'Failed to create order');
      console.error('Order creation error:', error);
    }
  };

  const cartItemsWithDetails: CartItem[] = cartItems.map((item) => {
    const shoe = item.shoe || shoes.find((s) => s.id === item.shoeId);
    return { ...item, shoe };
  });

  const totalPrice = cartItemsWithDetails.reduce((sum, item) => {
    if (!item.shoe) return sum;
    return sum + item.shoe.price * item.quantity;
  }, 0);

  const [firstName, lastName] = session?.user?.fullName
    ? session.user.fullName.split(' ')
    : ['', ''];
  const accountData = {
    firstName: firstName || '',
    lastName: lastName || '',
    email: session?.user?.email || '',
    phone: '',
  };

  return (
    <>
      {contextHolder}
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col md:flex-row md:gap-10">
          <div className="flex flex-col gap-6 md:gap-10 flex-1 mb-10 md:mb-20">
            <Block title="1. Cart" className="px-4 sm:px-6">
              {loading || isCartLoading ? (
                <div className="flex justify-center items-center">
                  <span
                    className="loading loading-bars loading-md text-primary"
                    aria-label="Loading"
                  />
                </div>
              ) : cartItemsWithDetails.length === 0 ? (
                <p className="text-center text-muted-foreground">
                  Your cart is empty
                </p>
              ) : (
                <div className="flex flex-col gap-4">
                  {cartItemsWithDetails.map(
                    ({ id, shoe, size, quantity, shoeId }) => (
                      <div
                        key={id}
                        className="flex items-center justify-between gap-4 p-4 border rounded-lg"
                      >
                        {shoe ? (
                          <div className="flex items-center gap-4 w-full">
                            <Link href={`/shoe/${shoeId}`}>
                              <Image
                                src={shoe.imageURL}
                                alt={`${shoe.model.name} - ${shoe.color}`}
                                width={64}
                                height={64}
                                className="rounded-md object-cover"
                              />
                            </Link>
                            <div className="flex-1 flex items-center justify-between gap-2">
                              <div>
                                <p className="font-medium text-base md:text-lg">
                                  {capitalizeWords(shoe.model.name)}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Size: {size} · ${shoe.price.toFixed(2)}
                                </p>
                              </div>
                              <div className="flex flex-col sm:flex-row items-center gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  onClick={() =>
                                    handleQuantityChange(id, quantity + 1)
                                  }
                                  disabled={quantityLoading}
                                  className="h-8 w-8 order-1 sm:order-none"
                                >
                                  <Plus className="size-4" />
                                </Button>
                                <span className="w-8 text-center text-sm order-2 sm:order-none">
                                  {quantity}
                                </span>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  onClick={() =>
                                    handleQuantityChange(id, quantity - 1)
                                  }
                                  disabled={quantityLoading || quantity === 1}
                                  className="h-8 w-8 order-3 sm:order-none"
                                >
                                  <Minus className="size-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <p className="text-destructive text-sm">
                            Item not found
                          </p>
                        )}
                      </div>
                    )
                  )}
                </div>
              )}
            </Block>

            <Block
              title="2. Personal Data"
              className="px-4 sm:px-6"
              endAdornment={
                <div className="flex gap-2 ml-2 items-center">
                  <Label htmlFor="use-account-data" className="text-sm">
                    Use account data
                  </Label>
                  <Switch
                    id="use-account-data"
                    checked={useAccountData}
                    onCheckedChange={handleSwitchChange}
                  />
                </div>
              }
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                <div>
                  <Input
                    name="firstName"
                    className={cn(
                      'text-base w-full py-2 sm:py-3',
                      errors.firstName && 'border-destructive'
                    )}
                    placeholder="First Name"
                    value={
                      useAccountData
                        ? accountData.firstName
                        : formData.firstName
                    }
                    onChange={handleInputChange}
                    disabled={useAccountData}
                  />
                  {errors.firstName && (
                    <p className="text-destructive text-sm mt-1">
                      {errors.firstName}
                    </p>
                  )}
                </div>
                <div>
                  <Input
                    name="lastName"
                    className={cn(
                      'text-base w-full py-2 sm:py-3',
                      errors.lastName && 'border-destructive'
                    )}
                    placeholder="Last Name"
                    value={
                      useAccountData ? accountData.lastName : formData.lastName
                    }
                    onChange={handleInputChange}
                    disabled={useAccountData}
                  />
                  {errors.lastName && (
                    <p className="text-destructive text-sm mt-1">
                      {errors.lastName}
                    </p>
                  )}
                </div>
                <div>
                  <Input
                    name="email"
                    className={cn(
                      'text-base w-full py-2 sm:py-3',
                      errors.email && 'border-destructive'
                    )}
                    placeholder="Email"
                    value={useAccountData ? accountData.email : formData.email}
                    onChange={handleInputChange}
                    disabled={useAccountData}
                  />
                  {errors.email && (
                    <p className="text-destructive text-sm mt-1">
                      {errors.email}
                    </p>
                  )}
                </div>
                <div>
                  <Input
                    name="phone"
                    className={cn(
                      'text-base w-full py-2 sm:py-3',
                      errors.phone && 'border-destructive'
                    )}
                    placeholder="Phone"
                    value={useAccountData ? accountData.phone : formData.phone}
                    onChange={handleInputChange}
                    disabled={useAccountData}
                  />
                  {errors.phone && (
                    <p className="text-destructive text-sm mt-1">
                      {errors.phone}
                    </p>
                  )}
                </div>
              </div>
            </Block>

            <Block title="3. Delivery Address" className="px-4 sm:px-6">
              <div className="flex flex-col gap-4">
                <div>
                  <Input
                    name="address"
                    className={cn(
                      'text-base',
                      errors.address && 'border-destructive'
                    )}
                    placeholder="Address"
                    value={formData.address}
                    onChange={handleInputChange}
                  />
                  {errors.address && (
                    <p className="text-destructive text-sm mt-1">
                      {errors.address}
                    </p>
                  )}
                </div>
                <Textarea
                  rows={4}
                  className="text-base"
                  placeholder="Order Comment"
                  name="comment"
                  onChange={handleInputChange}
                />
              </div>
            </Block>
          </div>

          <div className="w-full md:w-[450px] sticky top-4 self-start">
            <Block className="p-4 md:p-6">
              <div className="flex flex-col gap-1">
                <span className="text-xl md:text-2xl">Total:</span>
                <span className="text-2xl md:text-4xl font-extrabold">
                  ${totalPrice.toFixed(2)}
                </span>
              </div>
              <CheckoutItemDetails
                title={
                  <div className="flex items-center">
                    <Package size={16} className="mr-2 text-primary/80" />
                    Item Cost
                  </div>
                }
                value={`$${totalPrice.toFixed(2)}`}
              />
              <CheckoutItemDetails
                title={
                  <div className="flex items-center">
                    <Percent size={16} className="mr-2 text-primary/80" />
                    Tax
                  </div>
                }
                value={'$0.00'}
              />
              <CheckoutItemDetails
                title={
                  <div className="flex items-center">
                    <Truck size={16} className="mr-2 text-primary/80" />
                    Shipping
                  </div>
                }
                value={'$0.00'}
              />
              <Button
                type="submit"
                className="w-full h-12 md:h-14 rounded-2xl mt-4 md:mt-6 text-base font-bold group"
                disabled={
                  isCartLoading || loading || cartItemsWithDetails.length === 0
                }
              >
                Proceed to Payment
                <ArrowRight className="w-5 ml-2 group-hover:translate-x-2 transition" />
              </Button>
            </Block>
          </div>
        </div>
      </form>
    </>
  );
};

export default CheckoutClient;
