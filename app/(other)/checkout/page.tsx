import { Metadata } from 'next';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/prisma/prisma-client';
import { Container, Title } from '@/components/shared';
import CheckoutClient from './checkout-client';
import { ExtendedCartItem, ShoeCardType } from '@/components/shared/types';
import { authOptions } from '@/lib/auth';

// Define metadata for SEO
export const metadata: Metadata = {
  title: 'Checkout | Crossy',
  description:
    'Complete your purchase at Crossy. Review your cart, enter your personal details, and proceed to payment for a seamless checkout experience.',
  keywords: ['checkout', 'cart', 'purchase', 'e-commerce', 'shoes', 'store'],
  openGraph: {
    title: 'Checkout | Crossy',
    description: 'Review your cart and complete your purchase at Crossy',
    type: 'website',
  },
  robots: {
    index: false,
    follow: false,
  },
};

// Server-side data fetching
async function fetchCartItems(userId?: number): Promise<ExtendedCartItem[]> {
  if (!userId) return [];

  try {
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            shoe: {
              include: {
                model: {
                  include: {
                    brand: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    return (
      cart?.items.map((item) => ({
        id: item.id,
        cartId: item.cartId,
        shoeId: item.shoeId,
        size: item.size,
        quantity: item.quantity,
        createdAt: item.createdAt, // Keep as Date
        updatedAt: item.updatedAt, // Keep as Date
        shoe: item.shoe
          ? {
              id: item.shoe.id,
              imageURL: item.shoe.imageURL,
              description: item.shoe.description,
              color: item.shoe.color,
              gender: item.shoe.gender,
              price: item.shoe.price,
              model: {
                id: item.shoe.model.id,
                name: item.shoe.model.name,
                brandId: item.shoe.model.brandId,
                brand: {
                  name: item.shoe.model.brand.name,
                },
              },
            }
          : undefined,
      })) || []
    );
  } catch (error) {
    console.error('❌ Server error fetching cart:', error);
    return [];
  }
}

async function fetchShoes(): Promise<ShoeCardType[]> {
  try {
    const shoes = await prisma.shoe.findMany({
      include: {
        model: {
          include: {
            brand: true,
          },
        },
      },
    });
    return shoes.map((shoe) => ({
      id: shoe.id,
      imageURL: shoe.imageURL,
      description: shoe.description,
      color: shoe.color,
      gender: shoe.gender,
      price: shoe.price,
      model: {
        id: shoe.model.id,
        name: shoe.model.name,
        brandId: shoe.model.brandId,
        brand: {
          name: shoe.model.brand.name,
        },
      },
    }));
  } catch (error) {
    console.error('❌ Server error fetching shoes:', error);
    return [];
  }
}

export default async function CheckoutPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ? Number(session.user.id) : undefined;

  // Fetch initial cart items and shoes
  const initialCartItems = await fetchCartItems(userId);
  const shoes = await fetchShoes();

  // JSON-LD Schema for SEO (Organization and BreadcrumbList)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        name: 'Crossy',
        url: 'https://your-store-name.com',
        logo: 'https://your-store-name.com/images/logo.png',
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://your-store-name.com',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Checkout',
            item: 'https://your-store-name.com/checkout',
          },
        ],
      },
    ],
  };

  return (
    <Container className="mt-6 md:mt-10 px-4 sm:px-6">
      {/* SEO: JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Title
        text="Checkout"
        size="lg"
        className="font-extrabold mb-6 md:mb-8 text-2xl md:text-3xl"
      />
      <CheckoutClient
        initialCartItems={initialCartItems}
        shoes={shoes}
        session={session}
      />
    </Container>
  );
}
