'use client';

import { cn } from '@/lib/utils';
import { Container } from '@/components/shared';
import React, { useEffect, useState, memo } from 'react';
import { Button } from '../ui/button';
import { ArrowRight, Heart, Menu, User } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggleButton } from './theme-toggle-button';
import { SearchInput } from './search-input';
import { useSession } from 'next-auth/react';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useFavoritesStore } from '@/store/favorites';
import { DialogTitle } from '@radix-ui/react-dialog';
import { useCartStore } from '@/store/cart';
import { CartButton } from './cart-button';
import Image from 'next/image';

interface Props {
  className?: string;
  showSearch?: boolean;
}

export const Header: React.FC<Props> = memo(
  ({ className, showSearch = true }) => {
    const { data: session, status } = useSession();
    const { favorites } = useFavoritesStore();
    const { loadCachedCart, resetCart, subscribeToCartClear } = useCartStore();

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [userData, setUserData] = useState(session?.user);
    const [hasLoadedCart, setHasLoadedCart] = useState(false);

    useEffect(() => {
      let unsubscribe: (() => void) | undefined;

      if (status === 'authenticated' && session?.user?.id && !hasLoadedCart) {
        loadCachedCart(Number(session.user.id), true);
        setHasLoadedCart(true);

        const fetchUserData = async () => {
          try {
            const response = await fetch('/api/user/me', {
              cache: 'no-store',
            });
            if (response.ok) {
              const data = await response.json();
              setUserData(data);
            }
          } catch (error) {
            console.error('Failed to fetch user data:', error);
          }
        };
        fetchUserData();

        unsubscribe = subscribeToCartClear(() => {
          console.log('Header: Cart cleared');
        });
      } else if (status === 'unauthenticated') {
        resetCart();
        setUserData(undefined);
        setHasLoadedCart(false);
      }

      return () => {
        if (unsubscribe) unsubscribe();
      };
    }, [
      status,
      session?.user?.id,
      loadCachedCart,
      resetCart,
      subscribeToCartClear,
      hasLoadedCart,
    ]);

    // Loading placeholder
    if (status === 'loading') {
      return (
        <header className={cn('border border-border', className)}>
          <Container className="flex items-center justify-between py-4 sm:py-6 gap-4">
            <div className="animate-pulse bg-card h-10 sm:h-12 w-full rounded-md" />
          </Container>
        </header>
      );
    }

    const showProfileButton =
      status === 'authenticated' && !!session?.user?.username;

    return (
      <header className={cn('border border-border', className)}>
        <Container className="flex items-center justify-between py-4 sm:py-6 gap-4 relative">
          <div className="relative flex items-center justify-between w-full sm:w-auto">
            <Link href="/" className="sm:flex hidden items-center gap-2">
              <Image
                className="dark:invert brightness-0"
                src="/logo.png"
                alt="Logo"
                width={36}
                height={36}
                priority
              />
              <h1 className="text-2xl sm:text-3xl uppercase font-black text-foreground">
                crossy
              </h1>
            </Link>
            <Link
              href="/"
              className="absolute left-1/2 -translate-x-1/2 sm:hidden flex items-center gap-2"
            >
              <Image
                className="dark:invert brightness-0"
                src="/logo.png"
                alt="Logo"
                width={24}
                height={24}
                priority
              />
              <h1 className="text-xl uppercase font-black text-foreground">
                crossy
              </h1>
            </Link>
            <Drawer
              direction="left"
              open={isDrawerOpen}
              onOpenChange={setIsDrawerOpen}
            >
              <DrawerTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="sm:hidden ml-auto mr-3 text-foreground hover:bg-accent hover:text-accent-foreground"
                  aria-label="Open menu"
                >
                  <Menu size={24} />
                </Button>
              </DrawerTrigger>
              <DrawerContent className="w-3/4 sm:w-1/2 max-w-xs h-full rounded-none bg-card text-card-foreground">
                <VisuallyHidden asChild>
                  <DialogTitle>Mobile Navigation Menu</DialogTitle>
                </VisuallyHidden>
                <div className="flex flex-col gap-4 p-4">
                  <div className="flex-1 min-w-[200px]">
                    {showSearch && <SearchInput className="h-11 text-base" />}
                  </div>
                  <div className="flex flex-col gap-3">
                    <CartButton
                      className="w-full"
                      onClick={() => setIsDrawerOpen(false)}
                    />
                    <Link
                      href="/favorites"
                      onClick={() => setIsDrawerOpen(false)}
                    >
                      <Button className="group relative text-sm py-1 w-full bg-primary text-primary-foreground hover:bg-primary/90">
                        <div className="flex items-center gap-1 transition duration-300 group-hover:opacity-0 opacity-100">
                          <Heart
                            size={14}
                            strokeWidth={2}
                            fill={
                              favorites.length > 0 ? 'currentColor' : 'none'
                            }
                          />
                          <b>Favorites ({favorites.length})</b>
                        </div>
                        <ArrowRight className="w-4 absolute right-3 transition duration-300 -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0" />
                      </Button>
                    </Link>
                    {showProfileButton ? (
                      <Link
                        href={`/user/${userData?.username || session!.user.username}`}
                        onClick={() => setIsDrawerOpen(false)}
                      >
                        <Button
                          variant="outline"
                          className="flex items-center gap-1 text-sm py-1 w-full border-border text-foreground hover:bg-accent hover:text-accent-foreground"
                        >
                          <User size={14} />
                          Profile
                        </Button>
                      </Link>
                    ) : (
                      <Link
                        href="/login"
                        onClick={() => setIsDrawerOpen(false)}
                      >
                        <Button
                          variant="outline"
                          className="flex items-center gap-1 text-primary text-sm py-1 w-full border-border hover:bg-accent hover:text-accent-foreground"
                        >
                          <User size={14} />
                          Login
                        </Button>
                      </Link>
                    )}
                    <div className="flex justify-start">
                      <ThemeToggleButton />
                    </div>
                  </div>
                </div>
              </DrawerContent>
            </Drawer>
          </div>

          <div className="mx-6 hidden sm:flex flex-1 min-w-[200px]">
            {showSearch ? (
              <SearchInput className="h-11 text-base w-full" />
            ) : (
              <div className="h-11 w-full" />
            )}
          </div>

          <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
            {status !== 'authenticated' && (
              <Link href="/login">
                <Button
                  variant="outline"
                  className="flex items-center gap-1 text-primary text-base py-2 border-border hover:bg-accent hover:text-accent-foreground"
                >
                  <User size={16} />
                  Login
                </Button>
              </Link>
            )}
            <CartButton />
            <Link href="/favorites">
              <Button className="group relative text-base py-2 flex items-center justify-between w-fit bg-primary text-primary-foreground hover:bg-primary/90">
                <div className="flex items-center gap-1">
                  <Heart
                    size={16}
                    strokeWidth={2}
                    fill={favorites.length > 0 ? 'currentColor' : 'none'}
                  />
                  <span className="font-bold">Favorites</span>
                  <span className="transition duration-300 group-hover:opacity-0 opacity-100">
                    ({favorites.length})
                  </span>
                </div>
                <ArrowRight className="absolute right-3 transition duration-300 -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0" />
              </Button>
            </Link>
            <ThemeToggleButton />
            {showProfileButton &&
              (userData?.username || session?.user?.username) && (
                <Link
                  href={`/user/${userData?.username || session.user.username}`}
                  className="group relative"
                >
                  <Button
                    variant="outline"
                    size="icon"
                    className="p-2 border-border hover:bg-accent hover:text-accent-foreground"
                  >
                    <User size={16} />
                    <span className="sr-only">Profile</span>
                  </Button>
                </Link>
              )}
          </div>
        </Container>
      </header>
    );
  }
);

Header.displayName = 'Header';
