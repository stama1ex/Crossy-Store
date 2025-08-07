import { Metadata } from 'next';
import { Container } from '@/components/shared';
import Link from 'next/link';
import Image from 'next/image';
import RegisterClient from './register-client';

export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Register | Crossy',
  description:
    'Create your Crossy account to explore our latest sneaker collection and enjoy exclusive features.',
  keywords: ['register', 'sign up', 'account', 'sneakers', 'crossy'],
  robots: {
    index: false,
    follow: false,
  },
};

export default function RegisterPage() {
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
            name: 'Register',
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
        <RegisterClient />
      </div>
    </Container>
  );
}
