import { create } from 'zustand';
import { createJSONStorage, persist, StateStorage } from 'zustand/middleware';
import { FavoriteItem } from '@/components/shared/types';

const CACHE_KEY_PREFIX = 'favorites_';
const CACHE_EXPIRY_MS = 5 * 60 * 1000;

const fallbackStorage: StateStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

// debounce утилита
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const debounce = <F extends (...args: any[]) => any>(func: F, wait: number) => {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<F>): Promise<ReturnType<F>> => {
    return new Promise((resolve) => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        timeout = null;
        resolve(func(...args));
      }, wait);
    });
  };
};

// теговая инвалидация
const revalidateTag = debounce(async (tag: string) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
    console.log('Revalidate request timed out for tag:', tag);
  }, 5000);
  try {
    const response = await fetch(`/api/revalidate?tag=${tag}`, {
      method: 'POST',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!response.ok) {
      console.error(`Failed to revalidate ${tag}: ${response.status}`);
    }
  } catch (error) {
    console.error(`Revalidate ${tag} error:`, error);
  }
}, 1000);

interface FavoriteState {
  favorites: FavoriteItem[];
  likeCounts: Record<number, number>;
  pendingFavorites: Record<number, boolean>;
  setFavorites: (favorites: FavoriteItem[]) => void;
  setLikeCount: (shoeId: number, count: number) => void;
  addPendingFavorite: (shoeId: number, isFavorite: boolean) => void;
  syncFavorites: (userId: number | null) => Promise<void>;
  loadFavorites: (userId: number | null) => Promise<void>;
  toggleFavorite: (shoeId: number, userId: number | null) => Promise<void>;
  clearFavorites: (userId: number | null) => Promise<void>;
}

export const useFavoritesStore = create<FavoriteState>()(
  persist(
    (set, get) => {
      // Clear stale cache entries
      if (typeof localStorage !== 'undefined') {
        Object.keys(localStorage)
          .filter((key) => key.startsWith(CACHE_KEY_PREFIX))
          .forEach((key) => {
            const { favorites, timestamp } = JSON.parse(
              localStorage.getItem(key) || '{}'
            );
            if (
              !favorites ||
              !favorites.every(
                (fav: FavoriteItem) =>
                  fav.shoe &&
                  fav.shoe.model &&
                  fav.shoe.model.name &&
                  fav.shoe.model.brand?.name
              )
            ) {
              console.log(`Clearing stale localStorage cache for key: ${key}`);
              localStorage.removeItem(key);
            }
          });
      }

      const debouncedSyncFavorites = debounce(async (userId: number) => {
        await get().syncFavorites(userId);
      }, 1000);

      return {
        favorites: [],
        likeCounts: {},
        pendingFavorites: {},

        setFavorites: (favorites) => set({ favorites }),

        setLikeCount: (shoeId, count) =>
          set((state) => ({
            likeCounts: { ...state.likeCounts, [shoeId]: count },
          })),

        addPendingFavorite: (shoeId, isFavorite) =>
          set((state) => ({
            pendingFavorites: {
              ...state.pendingFavorites,
              [shoeId]: isFavorite,
            },
          })),

        loadFavorites: async (userId, forceReload = false) => {
          if (!userId) {
            console.warn(
              'loadFavorites: userId is undefined, setting empty favorites'
            );
            set({ favorites: [], likeCounts: {}, pendingFavorites: {} });
            return;
          }

          const cacheKey = `favorites_${userId}`;
          const cached = localStorage.getItem(cacheKey);

          if (cached && !forceReload) {
            try {
              const { favorites, likeCounts, timestamp } = JSON.parse(cached);
              if (Date.now() - timestamp < CACHE_EXPIRY_MS) {
                console.log('[favorites] Loaded from cache');
                set({
                  favorites,
                  likeCounts: likeCounts || {},
                  pendingFavorites: {},
                });
                return;
              }
            } catch (err) {
              console.error('[favorites] Failed to parse cache:', err);
            }
          }

          try {
            console.log(
              `loadFavorites: Fetching favorites for userId: ${userId}`
            );
            const res = await fetch(`/api/favorites?userId=${userId}`, {
              // Исправлен URL
              cache: 'no-store', // Заменяем next: { tags: ['favorites'] } на no-store для избежания кэширования
            });

            if (!res.ok) {
              const text = await res.text(); // Логируем текст ответа для отладки
              console.error(
                `loadFavorites: Failed to fetch, status: ${res.status}, response: ${text}`
              );
              throw new Error(
                `Failed to fetch favorites: ${res.status} ${text}`
              );
            }

            const data = await res.json();
            console.log('[favorites] Loaded from API:', data);

            set({
              favorites: data || [], // Учитываем, что API возвращает массив напрямую
              likeCounts: {}, // Обновите, если API начнёт возвращать likeCounts
              pendingFavorites: {},
            });

            localStorage.setItem(
              cacheKey,
              JSON.stringify({
                favorites: data || [],
                likeCounts: {}, // Обновите, если API возвращает likeCounts
                timestamp: Date.now(),
              })
            );

            console.log('[favorites] Loaded from API and updated localStorage');
          } catch (err) {
            console.error('[favorites] Failed to load from API:', err);
            // Загружаем из localStorage в случае ошибки
            if (cached) {
              try {
                const { favorites, likeCounts } = JSON.parse(cached);
                console.log('[favorites] Loaded from localStorage:', favorites);
                set({
                  favorites: favorites || [],
                  likeCounts: likeCounts || {},
                  pendingFavorites: {},
                });
              } catch (cacheErr) {
                console.error(
                  '[favorites] Failed to parse localStorage:',
                  cacheErr
                );
                set({ favorites: [], likeCounts: {}, pendingFavorites: {} });
              }
            } else {
              set({ favorites: [], likeCounts: {}, pendingFavorites: {} });
            }
          }
        },

        toggleFavorite: async (shoeId, userId) => {
          if (!userId) return;

          const isAlreadyFavorite = get().favorites.some(
            (fav) => fav.shoeId === shoeId
          );
          const currentLikeCount = get().likeCounts[shoeId] || 0;

          // Optimistic update
          set((state) => ({
            favorites: isAlreadyFavorite
              ? state.favorites.filter((fav) => fav.shoeId !== shoeId)
              : [
                  ...state.favorites,
                  { id: shoeId, shoeId, userId, shoe: undefined },
                ],
            likeCounts: {
              ...state.likeCounts,
              [shoeId]: isAlreadyFavorite
                ? currentLikeCount - 1
                : currentLikeCount + 1,
            },
            pendingFavorites: {
              ...state.pendingFavorites,
              [shoeId]: !isAlreadyFavorite,
            },
          }));

          // ⬇️ Сделай запрос к toggle API (чтобы запустить revalidateTag)
          const res = await fetch('/api/favorites/toggle', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ shoeId }),
          });

          const data = await res.json();

          if (res.ok) {
            set({
              favorites: data.favorites,
              likeCounts: {
                ...get().likeCounts,
                ...data.likeCounts,
              },
              pendingFavorites: {},
            });

            // 🟡 Также перезапишем кэш
            if (typeof localStorage !== 'undefined') {
              localStorage.setItem(
                `${CACHE_KEY_PREFIX}${userId}`,
                JSON.stringify({
                  favorites: data.favorites,
                  likeCounts: data.likeCounts,
                  timestamp: Date.now(),
                })
              );
            }
          } else {
            console.error('toggleFavorite: Failed toggle sync', data);
          }
        },

        syncFavorites: async (userId: number | null) => {
          if (!userId || Object.keys(get().pendingFavorites).length === 0) {
            console.log('syncFavorites: No userId or pending favorites');
            return;
          }

          const pendingFavorites = { ...get().pendingFavorites };
          console.log(
            `syncFavorites: Syncing for userId ${userId}`,
            pendingFavorites
          );

          const validPendingFavorites = Object.fromEntries(
            Object.entries(pendingFavorites).filter(
              ([shoeId, isFavorite]) =>
                !isNaN(Number(shoeId)) && typeof isFavorite === 'boolean'
            )
          );

          try {
            const res = await fetch('/api/favorites/batch', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId,
                pendingFavorites: validPendingFavorites,
              }),
            });

            console.log(
              `syncFavorites: Batch sync response status: ${res.status}`
            );
            const data = await res.json();
            console.log(`syncFavorites: Batch sync response data:`, data);

            if (!res.ok) {
              throw new Error(
                `Batch sync failed: ${res.status} ${res.statusText}`
              );
            }

            const { favorites, likeCounts } = data;

            set((state) => ({
              favorites,
              likeCounts: { ...state.likeCounts, ...likeCounts },
              pendingFavorites: {},
            }));
            console.log(
              `syncFavorites: State synchronized for userId ${userId}`,
              { favorites, likeCounts }
            );

            if (typeof localStorage !== 'undefined') {
              localStorage.setItem(
                `${CACHE_KEY_PREFIX}${userId}`,
                JSON.stringify({
                  favorites,
                  likeCounts: get().likeCounts,
                  timestamp: Date.now(),
                })
              );
              console.log(
                `syncFavorites: localStorage updated for userId ${userId}`
              );
            }

            await Promise.all([
              revalidateTag(`favorites-${userId}`),
              ...Object.keys(pendingFavorites).map((shoeId) =>
                revalidateTag(`shoe-${shoeId}`)
              ),
            ]);
            console.log('syncFavorites: Revalidation completed');
          } catch (error: unknown) {
            console.error(`syncFavorites: Error for userId ${userId}`, error);
            throw error;
          }
        },

        clearFavorites: async (userId) => {
          if (!userId) return;

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);

          const currentFavorites = get().favorites;
          const shoeIds = currentFavorites.map((fav) => fav.shoeId);

          try {
            const res = await fetch('/api/favorites/clear', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId }),
              signal: controller.signal,
            });
            clearTimeout(timeoutId);

            if (!res.ok) {
              throw new Error(`Clear failed: ${res.status} ${res.statusText}`);
            }

            const { favorites, likeCounts } = await res.json();

            set((state) => ({
              favorites,
              likeCounts: { ...state.likeCounts, ...likeCounts },
              pendingFavorites: {},
            }));

            if (typeof localStorage !== 'undefined') {
              localStorage.setItem(
                `${CACHE_KEY_PREFIX}${userId}`,
                JSON.stringify({
                  favorites,
                  likeCounts: get().likeCounts,
                  timestamp: Date.now(),
                })
              );
            }

            await Promise.all([
              revalidateTag(`favorites-${userId}`),
              ...shoeIds.map((shoeId) => revalidateTag(`shoe-${shoeId}`)),
            ]);
          } catch (error) {
            console.error(`clearFavorites: Error for userId ${userId}`, error);
            throw error;
          }
        },
      };
    },
    {
      name: 'favorites-storage',
      storage: createJSONStorage(() =>
        typeof localStorage !== 'undefined' ? localStorage : fallbackStorage
      ),
    }
  )
);
