import { Metadata } from 'next';
import { getServerSession } from 'next-auth/next';
import { Container } from '@/components/shared';
import Link from 'next/link';
import Image from 'next/image';
import LoginClient from './login-client';
import { authOptions } from '@/lib/auth';

export const revalidate = 0; // No caching for login page

export const metadata: Metadata = {
  title: 'Login | Crossy',
  description:
    'Sign in to your Crossy account to continue shopping and access your personalized features.',
  keywords: ['login', 'sign in', 'account', 'sneakers', 'crossy'],
  robots: {
    index: false, // Prevent indexing of user-specific page
    follow: false,
  },
};

export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  // JSON-LD Schema for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        name: 'Crossy',
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Login',
          },
        ],
      },
    ],
  };

  return (
    <Container className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          href="/"
          className="flex items-center gap-2 self-center font-medium"
          prefetch
        >
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <Image
              className="not-dark:invert brightness-0"
              src="/logo.png"
              alt="Crossy Logo"
              width={16}
              height={16}
              priority
            />
          </div>
          Crossy
        </Link>
        <LoginClient session={session} />
      </div>
    </Container>
  );
}
