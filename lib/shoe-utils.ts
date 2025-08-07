import { prisma } from '@/prisma/prisma-client';
import { unstable_cache } from 'next/cache';
import { ShoeCardWithFavorites, ShoeComment } from '@/components/shared/types';

export async function getShoeWithComments(
  id: number
): Promise<(ShoeCardWithFavorites & { comments: ShoeComment[] }) | null> {
  const shoe = await prisma.shoe.findUnique({
    where: { id },
    include: {
      model: { include: { brand: true } },
      favorites: true,
      comments: {
        include: {
          user: { select: { fullName: true, avatar: true, username: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });
  if (!shoe) return null;
  return {
    id: shoe.id,
    name: shoe.model.name, // Use model.name directly
    price: shoe.price,
    imageURL: shoe.imageURL || '',
    color: shoe.color || 'NEUTRAL', // Default or fetch from Prisma
    description: shoe.description ?? undefined, // Convert null to undefined
    gender: shoe.gender || 'Unisex',
    model: {
      name: shoe.model.name,
      brand: {
        name: shoe.model.brand.name,
      },
    },
    comments: shoe.comments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      userId: comment.userId,
      shoeId: comment.shoeId,
      user: {
        fullName: comment.user.fullName || comment.user.username || 'Anonymous',
        avatar: comment.user.avatar || null,
        username: comment.user.username || null,
      },
    })),
    createdAt: shoe.createdAt,
    updatedAt: shoe.updatedAt,
    favorites: shoe.favorites,
  };
}

export const getCachedShoeWithComments = (shoeId: number) =>
  unstable_cache(() => getShoeWithComments(shoeId), [`shoe-${shoeId}`], {
    tags: [`shoe-${shoeId}`],
    revalidate: 60,
  });
