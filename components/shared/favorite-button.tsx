'use client';

import React, { useEffect, useCallback } from 'react';
import { Heart } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useFavoritesStore } from '@/store/favorites';

interface Props {
  shoeId: number;
  isFavorited?: boolean;
  likeCount?: number;
  className?: string;
  details?: boolean;
  userId?: number | null;
}

export const FavoriteButton: React.FC<Props> = ({
  shoeId,
  isFavorited: serverIsFavorited = false,
  likeCount: initialLikeCount = 0,
  className,
  details = false,
  userId,
}) => {
  const { loadFavorites } = useFavoritesStore();

  useEffect(() => {
    if (userId) {
      loadFavorites(userId);
    }
  }, [userId, loadFavorites]);
  const { data: session, status } = useSession();
  const router = useRouter();
  const { favorites, likeCounts, toggleFavorite, setLikeCount } =
    useFavoritesStore();

  useEffect(() => {
    if (typeof likeCounts?.[shoeId] !== 'number') {
      setLikeCount(shoeId, initialLikeCount);
    }
  }, [initialLikeCount, shoeId, setLikeCount, likeCounts]);

  useEffect(() => {
    if (!session?.user?.id) return;

    const handleBeforeUnload = async (event: BeforeUnloadEvent) => {
      console.log('Page unload detected, syncing favorites');
      await useFavoritesStore.getState().syncFavorites(Number(session.user.id));
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [session]);

  const isFavorite = favorites.some((fav) => fav.shoeId === shoeId);
  const localLikeCount =
    typeof likeCounts?.[shoeId] === 'number'
      ? likeCounts[shoeId]
      : initialLikeCount;

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (status === 'loading') {
        console.log('Click ignored: status loading');
        return;
      }
      if (!session?.user?.id) {
        console.log('Redirecting to login');
        router.push('/login');
        return;
      }

      console.log('Toggling favorite for shoeId:', shoeId);
      toggleFavorite(shoeId, Number(session.user.id));
    },
    [status, session, router, shoeId, toggleFavorite]
  );

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <button
        type="button"
        onClick={handleClick}
        disabled={status === 'loading'}
        className={cn(
          'flex items-center justify-center p-3 sm:p-2 rounded-full hover:bg-black/20 cursor-pointer'
        )}
      >
        <Heart
          className={cn(
            'w-6 h-6 sm:w-5 sm:h-5 transition-transform duration-200',
            isFavorite && 'scale-110 text-primary'
          )}
          fill={isFavorite ? 'currentColor' : 'none'}
        />
      </button>
      {details && (
        <span className="mr-2 text-md text-muted-foreground">
          {localLikeCount}
        </span>
      )}
    </div>
  );
};
