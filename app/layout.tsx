import type { Metadata } from 'next';
import { Rubik } from 'next/font/google'; // Импорт шрифта Rubik
import './globals.css';
import { Providers } from '@/components/providers/providers';
import { Footer } from '@/components/shared/footer';

const rubik = Rubik({
  subsets: ['latin'],
  weight: ['400', '500', '700', '800', '900'],
  variable: '--font-rubik',
});

export const metadata: Metadata = {
  title: 'Crossy',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={rubik.className}>
        <main className="min-h-screen">
          <Providers>{children}</Providers>
        </main>
        <Footer />
      </body>
    </html>
  );
}
