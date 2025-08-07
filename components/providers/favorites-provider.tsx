'use client';

import { useFavoritesLoader } from '@/hooks/use-favorites-loader';
import React from 'react';

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  useFavoritesLoader();
  return <>{children}</>;
}
