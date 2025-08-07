'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useFavoritesStore } from '@/store/favorites';

export function useFavoritesLoader() {
  const { data: session, status } = useSession();
  const { setFavorites, loadFavorites } = useFavoritesStore();
  const isInitialMount = useRef(true);
  const userId = session?.user?.id ? Number(session.user.id) : null;

  useEffect(() => {
    if (status === 'loading') return;

    let isCancelled = false;

    const fetchFavorites = async () => {
      if (isCancelled || !userId) return;
      try {
        await loadFavorites(userId);
      } catch (err) {
        console.error('Favorites fetch error:', err);
        if (!isCancelled) {
          setFavorites([]);
        }
      }
    };

    if (isInitialMount.current && !userId) {
      setFavorites([]);
      isInitialMount.current = false;
      return;
    }

    if (userId) {
      fetchFavorites();
    } else {
      setFavorites([]);
    }

    isInitialMount.current = false;

    return () => {
      isCancelled = true;
    };
  }, [userId, status, setFavorites, loadFavorites]);

  // 👇 Кросс-вкладочная синхронизация
  useEffect(() => {
    if (!userId) return;

    const handleStorage = (event: StorageEvent) => {
      if (event.key === `favorites_${userId}`) {
        loadFavorites(userId);
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [userId, loadFavorites]);
}
