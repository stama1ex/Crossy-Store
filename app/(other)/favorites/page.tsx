// app/favorites/page.tsx
import { Metadata } from 'next';
import FavoritesPageClient from './favorites-client';

export const metadata: Metadata = {
  title: 'Favorite Sneakers | Crossy',
  description: 'Browse and manage sneakers you added to your favorites list.',
};

export default function FavoritesPage() {
  return <FavoritesPageClient />;
}
