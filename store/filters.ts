import { create } from 'zustand';

interface FilterState {
  colors: string[]; // ['NEUTRAL', 'OTHER']
  priceFrom: number;
  priceTo: number;
  gender: 'male' | 'female' | null;

  // Сеттеры
  setColors: (color: string, checked: boolean) => void;
  setPriceFrom: (value: number) => void;
  setPriceTo: (value: number) => void;
  setGender: (gender: 'male' | 'female' | null) => void;

  // Сброс фильтров
  resetFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  colors: [],
  priceFrom: 0,
  priceTo: 300,
  gender: null,

  setColors: (color, checked) =>
    set((state) => ({
      colors: checked
        ? [...state.colors, color]
        : state.colors.filter((c) => c !== color),
    })),

  setPriceFrom: (value) =>
    set(() => ({
      priceFrom: value,
    })),

  setPriceTo: (value) =>
    set(() => ({
      priceTo: value,
    })),

  setGender: (gender) =>
    set(() => ({
      gender,
    })),

  resetFilters: () =>
    set(() => ({
      colors: [],
      priceFrom: 0,
      priceTo: 300,
      gender: null,
    })),
}));
