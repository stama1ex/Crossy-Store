'use client';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect, useMemo } from 'react';
import { ShoeCardType } from '@/components/shared/types';
import AuthGuard from '@/components/auth/auth-guard';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { message } from 'antd';
import { useFavoritesStore } from '@/store/favorites';
import { capitalizeWords } from '@/lib/utils';

interface FavoriteItem {
  id: number;
  shoeId: number;
  userId: number;
  shoe?: ShoeCardType;
}

export default function FavoritesPage() {
  const { data: session } = useSession();
  const [messageApi, contextHolder] = message.useMessage();
  const { favorites, setFavorites, loadFavorites } = useFavoritesStore();
  const [shoes, setShoes] = useState<ShoeCardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [removeLoading, setRemoveLoading] = useState<number | null>(null);
  const [clearLoading, setClearLoading] = useState(false);

  const fetchShoes = async () => {
    try {
      const shoesRes = await fetch('/api/shoes');
      if (!shoesRes.ok) {
        const errorText = await shoesRes.text();
        throw new Error(
          `Failed to fetch shoes: ${shoesRes.status} ${errorText || ''}`
        );
      }
      const shoesData = await shoesRes.json();
      setShoes(shoesData);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to fetch shoes:', { error, message: errorMessage });
      messageApi.error(errorMessage || 'Failed to load shoes');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchShoes();
        if (session?.user?.id) {
          console.log(
            `FavoritesPage: Triggering loadFavorites for userId ${session.user.id}`
          );
          await loadFavorites(Number(session.user.id));
        }
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        console.error('Failed to fetch data:', {
          error,
          message: errorMessage,
        });
        messageApi.error(errorMessage || 'Failed to load favorites');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [session, setFavorites, loadFavorites, messageApi]);

  const handleRemoveFromFavorites = async (shoeId: number) => {
    if (!session?.user?.id) {
      messageApi.error('Please sign in to remove favorites');
      return;
    }

    setRemoveLoading(shoeId);
    try {
      const res = await fetch('/api/favorites/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shoeId }),
      });

      if (!res.ok) {
        throw new Error(`Failed to toggle favorite: ${res.status}`);
      }

      const { favorites, likeCounts } = await res.json();
      // Update favorites in store
      setFavorites(favorites);
      console.log(
        `FavoritesPage: Removed favorite for shoeId ${shoeId}, updated state`,
        { favorites, likeCounts }
      );

      // Update localStorage
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(
          `favorites_${session.user.id}`,
          JSON.stringify({
            favorites,
            likeCounts,
            timestamp: Date.now(),
          })
        );
      }

      // Revalidate caches
      await Promise.all([
        fetch(`/api/revalidate?tag=favorites-${session.user.id}`, {
          method: 'POST',
        }),
        fetch(`/api/revalidate?tag=shoe-${shoeId}`, { method: 'POST' }),
      ]);

      messageApi.success('Item removed from favorites');
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to remove item:', { error, message: errorMessage });
      messageApi.error(errorMessage || 'Failed to remove item from favorites');
    } finally {
      setRemoveLoading(null);
    }
  };

  const handleClearFavorites = async () => {
    if (!session?.user?.id) {
      messageApi.error('Please sign in to clear favorites');
      return;
    }

    setClearLoading(true);
    try {
      const res = await fetch('/api/favorites/clear', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: Number(session.user.id) }),
      });

      if (!res.ok) {
        throw new Error(`Clear failed: ${res.status}`);
      }

      const { favorites: newFavorites, likeCounts } = await res.json();
      console.log('Clear favorites response:', { newFavorites, likeCounts });

      // Обновляем состояние
      setFavorites(newFavorites || []); // Убедитесь, что передаётся пустой массив

      // Обновляем localStorage
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(
          `favorites_${session.user.id}`,
          JSON.stringify({
            favorites: [], // Явно устанавливаем пустой массив
            likeCounts,
            timestamp: Date.now(),
          })
        );
      }

      // Ревалидация кэша
      const shoeIds = favorites.map((fav: FavoriteItem) => fav.shoeId);
      await Promise.all([
        fetch(`/api/revalidate?tag=favorites-${session.user.id}`, {
          method: 'POST',
        }),
        ...shoeIds.map((shoeId: number) =>
          fetch(`/api/revalidate?tag=shoe-${shoeId}`, { method: 'POST' })
        ),
      ]);

      messageApi.success('Favorites cleared');
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to clear favorites:', {
        error,
        message: errorMessage,
      });
      messageApi.error(errorMessage || 'Failed to clear favorites');
    } finally {
      setClearLoading(false);
    }
  };

  const favoritesWithDetails: FavoriteItem[] = useMemo(() => {
    return favorites.map((fav) => {
      const shoe = fav.shoe || shoes.find((s) => s.id === fav.shoeId);
      console.log(
        `FavoritesPage: Processing favorite for shoeId ${fav.shoeId}`,
        {
          hasFavShoe: !!fav.shoe,
          foundInShoes: !!shoes.find((s) => s.id === fav.shoeId),
          shoe,
        }
      );
      if (!shoe) {
        console.warn(`FavoritesPage: No shoe found for shoeId ${fav.shoeId}`);
      } else if (!shoe.model) {
        console.warn(`FavoritesPage: Shoe ${fav.shoeId} has no model`, {
          shoe,
        });
      }
      return { ...fav, shoe };
    });
  }, [favorites, shoes]);

  if (!session) {
    return (
      <AuthGuard>
        <div className="min-h-svh bg-muted/30 p-6 md:p-10">
          <p className="text-center text-muted-foreground">
            Please log in to view your favorites.
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
              <CardTitle className="text-xl">Your Favorites</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {loading ? (
                <div className="flex justify-center items-center">
                  <span className="loading loading-bars loading-md text-primary" />
                </div>
              ) : favoritesWithDetails.length === 0 ? (
                <p className="text-center text-muted-foreground">
                  Your favorites list is empty.
                </p>
              ) : (
                favoritesWithDetails.map(({ shoe, shoeId }) => (
                  <div
                    key={shoeId}
                    className="flex items-center justify-between gap-4 rounded-lg border p-3"
                  >
                    {shoe && shoe.model ? (
                      <Link
                        href={`/shoe/${shoeId}`}
                        className="flex items-center gap-4 flex-1"
                      >
                        <Image
                          src={shoe.imageURL}
                          alt={shoe.model.name || 'Shoe'}
                          width={64}
                          height={64}
                          className="rounded-md object-cover"
                          priority={favoritesWithDetails.length <= 3}
                        />
                        <div>
                          <p className="font-medium hover:underline">
                            {capitalizeWords(shoe.model.name) ||
                              'Unknown Model'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {shoe.description || 'No description'}
                          </p>
                          <p className="text-sm text-foreground">
                            ${shoe.price ? shoe.price.toFixed(2) : 'N/A'}
                          </p>
                        </div>
                      </Link>
                    ) : (
                      <p className="text-destructive text-sm flex-1">
                        Shoe not found (ID: {shoeId})
                      </p>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveFromFavorites(shoeId)}
                      disabled={removeLoading === shoeId}
                      aria-busy={removeLoading === shoeId}
                    >
                      {removeLoading === shoeId ? (
                        <span className="loading loading-bars loading-md text-primary" />
                      ) : (
                        <Trash2 className="size-4 text-destructive" />
                      )}
                    </Button>
                  </div>
                ))
              )}
              {favoritesWithDetails.length > 0 && (
                <div className="mt-4 flex flex-col gap-4 border-t pt-4">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleClearFavorites}
                    disabled={clearLoading}
                    aria-busy={clearLoading}
                  >
                    {clearLoading ? (
                      <div className="flex items-center gap-2">
                        <span className="loading loading-bars loading-sm text-primary" />
                        Clearing...
                      </div>
                    ) : (
                      'Clear Favorites'
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  );
}
