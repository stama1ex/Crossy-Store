import { notFound } from 'next/navigation';
import { prisma } from '@/prisma/prisma-client';
import { getServerSession } from 'next-auth';
import { capitalizeWords } from '@/lib/utils';
import { Metadata } from 'next';
import ShoePageClient from './shoe-page-client';
import { getCachedShoeWithComments } from '@/lib/shoe-utils';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 60;

interface Props {
  params: Promise<{ id: string }>;
}

// 🧠 SEO-метаданные
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const shoeId = Number(resolvedParams.id);
  if (isNaN(shoeId)) return {};

  const shoe = await prisma.shoe.findUnique({
    where: { id: shoeId },
    include: {
      model: { include: { brand: true } },
    },
  });

  if (!shoe) return {};

  const title = `${capitalizeWords(`${shoe.model.brand.name} ${shoe.model.name}`)} | Crossy`;
  const description =
    shoe.description || 'Check out this stylish pair of sneakers!';

  return { title, description };
}

// 🖼️ Страница
export default async function ShoePage({ params }: Props) {
  const resolvedParams = await params;
  const shoeId = Number(resolvedParams.id);
  if (isNaN(shoeId)) return notFound();

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ? Number(session.user.id) : null;

  const shoe = await getCachedShoeWithComments(shoeId)();
  if (!shoe) return notFound();

  const isFavorited = userId
    ? !!(await prisma.favorite.findFirst({
        where: { shoeId, userId },
        select: { id: true },
      }))
    : false;

  const likeCount = await prisma.favorite.count({ where: { shoeId } });

  return (
    <ShoePageClient
      shoe={shoe}
      isFavorited={isFavorited}
      likeCount={likeCount}
      userId={userId}
    />
  );
}
