// store/cart-button.ts
import { create } from 'zustand';

interface CartButtonState {
  isInHeader: boolean;
  setIsInHeader: (isInHeader: boolean) => void;
}

export const useCartButtonStore = create<CartButtonState>((set) => ({
  isInHeader: true, // Default to true since Header is visible on load
  setIsInHeader: (isInHeader) => set({ isInHeader }),
}));
