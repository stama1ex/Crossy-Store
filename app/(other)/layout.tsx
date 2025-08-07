import { Header } from '@/components/shared';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Crossy',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="min-h-screen">
      <Header showSearch={false} />
      {children}
    </main>
  );
}
