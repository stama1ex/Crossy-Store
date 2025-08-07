'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import NextTopLoader from 'nextjs-toploader';
import { FavoritesProvider } from './favorites-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchInterval={5 * 60}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <NextTopLoader color="var(--primary)" showSpinner={false} />
        <FavoritesProvider>{children}</FavoritesProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
