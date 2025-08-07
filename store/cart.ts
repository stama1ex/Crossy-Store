'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { produce } from 'immer';
import { CartItem as PrismaCartItem } from '@prisma/client';
import { ShoeCardType } from '@/components/shared/types';

export interface CartItem extends PrismaCartItem {
  shoe?: ShoeCardType;
}

interface CartStore {
  items: CartItem[];
  lastFetched: number | null;
  isCartLoading: boolean;
  isCartCleared: boolean;
  setCartItems: (items: CartItem[], userId?: number) => void;
  setCartLoading: (isLoading: boolean) => void;
  loadCachedCart: (userId: number, force?: boolean) => Promise<void>;
  addToCart: (shoeId: number, size: number, userId?: number) => Promise<void>;
  removeFromCart: (id: number, userId?: number) => Promise<void>;
  clearCart: (userId?: number) => Promise<void>;
  updateQuantity: (
    itemId: number,
    quantity: number,
    userId?: number
  ) => Promise<void>;
  resetCart: () => void;
  subscribeToCartClear: (callback: () => void) => () => void;
}

const CACHE_KEY_PREFIX = 'cart_';
const CACHE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

const cartClearSubscribers: Array<() => void> = [];

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      lastFetched: null,
      isCartLoading: false,
      isCartCleared: false,
      setCartItems: (items, userId) => {
        set(
          produce((state) => {
            state.items = items;
            state.lastFetched = Date.now();
            state.isCartCleared = false;
          })
        );
        if (userId) {
          fetch(`/api/revalidate?tag=cart-${userId}`, { method: 'POST' });
        }
      },
      setCartLoading: (isLoading) => set({ isCartLoading: isLoading }),
      loadCachedCart: async (userId, force = false) => {
        const state = get();
        const now = Date.now();
        if (
          !force &&
          state.items.length > 0 &&
          state.lastFetched &&
          now - state.lastFetched < CACHE_EXPIRY_MS
        ) {
          return;
        }
        set({ isCartLoading: true });
        try {
          const response = await fetch('/api/cart', {
            headers: { 'Content-Type': 'application/json' },
            cache: 'no-store',
          });
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
              `Failed to fetch cart: ${response.status} ${errorText || ''}`
            );
          }
          const { items } = await response.json();
          set(
            produce((state) => {
              state.items = items || [];
              state.lastFetched = Date.now();
              state.isCartCleared = false;
            })
          );
          if (userId) {
            localStorage.setItem(
              `${CACHE_KEY_PREFIX}${userId}`,
              JSON.stringify({
                items: items || [],
                lastFetched: Date.now(),
              })
            );
          }
        } catch (error) {
          console.error('Failed to load cached cart:', error);
          set(
            produce((state) => {
              state.items = [];
              state.lastFetched = null;
              state.isCartCleared = false;
            })
          );
        } finally {
          set({ isCartLoading: false });
        }
      },
      addToCart: async (shoeId, size, userId) => {
        if (!userId) return;
        set({ isCartLoading: true });
        try {
          set(
            produce((state) => {
              const existingItem = state.items.find(
                (item: CartItem) => item.shoeId === shoeId && item.size === size
              );
              if (existingItem) {
                existingItem.quantity += 1;
              } else {
                state.items.push({
                  id: Date.now(),
                  cartId: 0,
                  shoeId,
                  size,
                  quantity: 1,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  shoe: undefined,
                });
              }
              state.isCartCleared = false;
            })
          );

          const response = await fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ shoeId, size, quantity: 1 }),
          });
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
              `Failed to add to cart: ${response.status} ${errorText || ''}`
            );
          }
          const data = await response.json();
          set(
            produce((state) => {
              state.items = data.items || [];
              state.lastFetched = Date.now();
              state.isCartCleared = false;
            })
          );
          if (userId) {
            localStorage.setItem(
              `${CACHE_KEY_PREFIX}${userId}`,
              JSON.stringify({
                items: data.items || [],
                lastFetched: Date.now(),
              })
            );
            fetch(`/api/revalidate?tag=cart-${userId}`, { method: 'POST' });
          }
        } catch (error) {
          console.error('Add to cart error:', error);
          throw error;
        } finally {
          set({ isCartLoading: false });
        }
      },
      removeFromCart: async (id, userId) => {
        if (!userId) return;
        set({ isCartLoading: true });
        try {
          const response = await fetch(`/api/cart/item/${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
          });
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
              `Failed to remove from cart: ${response.status} ${errorText || ''}`
            );
          }
          set(
            produce((state) => {
              state.items = state.items.filter(
                (item: CartItem) => item.id !== id
              );
              state.lastFetched = Date.now();
              state.isCartCleared = false;
            })
          );
          if (userId) {
            localStorage.setItem(
              `${CACHE_KEY_PREFIX}${userId}`,
              JSON.stringify({
                items: get().items,
                lastFetched: Date.now(),
              })
            );
            fetch(`/api/revalidate?tag=cart-${userId}`, { method: 'POST' });
          }
        } catch (error) {
          console.error('Remove from cart error:', error);
          throw error;
        } finally {
          set({ isCartLoading: false });
        }
      },
      clearCart: async (userId) => {
        if (!userId) return;
        set({ isCartLoading: true });
        try {
          const response = await fetch('/api/cart/clear', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
          });
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
              `Failed to clear cart: ${response.status} ${errorText || ''}`
            );
          }
          set(
            produce((state) => {
              state.items = [];
              state.lastFetched = Date.now();
              state.isCartCleared = true;
            })
          );
          if (userId) {
            localStorage.removeItem(`${CACHE_KEY_PREFIX}${userId}`);
            fetch(`/api/revalidate?tag=cart-${userId}`, { method: 'POST' });
          }
          cartClearSubscribers.forEach((callback) => callback());
        } catch (error) {
          console.error('Clear cart error:', error);
          throw error;
        } finally {
          set({ isCartLoading: false });
        }
      },
      updateQuantity: async (itemId, quantity, userId) => {
        if (quantity < 1) return;
        set(
          produce((state) => {
            state.items = state.items.map((item: CartItem) =>
              item.id === itemId ? { ...item, quantity } : item
            );
            state.isCartCleared = false;
          })
        );
        if (userId) {
          try {
            const response = await fetch('/api/cart', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ itemId, quantity }),
            });
            if (!response.ok) {
              const errorText = await response.text();
              throw new Error(
                `Failed to update quantity: ${response.status} ${errorText || ''}`
              );
            }
            const { items } = await response.json();
            set(
              produce((state) => {
                state.items = items;
                state.lastFetched = Date.now();
                state.isCartCleared = false;
              })
            );
            if (userId) {
              localStorage.setItem(
                `${CACHE_KEY_PREFIX}${userId}`,
                JSON.stringify({
                  items,
                  lastFetched: Date.now(),
                })
              );
              fetch(`/api/revalidate?tag=cart-${userId}`, { method: 'POST' });
            }
          } catch (error) {
            set(
              produce((state) => {
                state.items = state.items.map((item: CartItem) =>
                  item.id === itemId
                    ? { ...item, quantity: item.quantity }
                    : item
                );
              })
            );
            console.error('Failed to update quantity:', error);
            throw error;
          }
        }
      },
      resetCart: () => {
        set(
          produce((state) => {
            state.items = [];
            state.lastFetched = null;
            state.isCartCleared = true;
          })
        );
        Object.keys(localStorage)
          .filter((key) => key.startsWith(CACHE_KEY_PREFIX))
          .forEach((key) => localStorage.removeItem(key));
        cartClearSubscribers.forEach((callback) => callback());
      },
      subscribeToCartClear: (callback) => {
        cartClearSubscribers.push(callback);
        return () => {
          const index = cartClearSubscribers.indexOf(callback);
          if (index !== -1) {
            cartClearSubscribers.splice(index, 1);
          }
        };
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        lastFetched: state.lastFetched,
      }),
    }
  )
);
