// app/cart/page.tsx
import CartPageClient from './cart-client';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shopping Cart | Crossy',
  description: 'View and manage items in your shopping cart.',
};

export default function CartPage() {
  return <CartPageClient />;
}
