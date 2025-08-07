'use client';

import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cart';

export function LogoutButton() {
  const { resetCart } = useCartStore();

  const handleLogout = async () => {
    try {
      // Clear cart state and localStorage
      resetCart();
      // Trigger NextAuth sign-out
      await signOut({ callbackUrl: '/login' });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <Button
      onClick={handleLogout}
      variant="destructive"
      className="w-full text-sm font-medium"
    >
      Sign Out
    </Button>
  );
}
