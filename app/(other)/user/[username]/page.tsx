import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/prisma/prisma-client';
import { getServerSession } from 'next-auth';
import { unstable_cache } from 'next/cache';
import type { Metadata } from 'next';
import UserProfile from './profile-client';
import { authOptions } from '@/lib/auth';

interface Props {
  params: Promise<{ username: string }>;
}

export const revalidate = 60;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      fullName: true,
      username: true,
    },
  });

  if (!user) return { title: 'User Not Found' };

  const displayName = user.fullName || user.username;

  return {
    title: `${displayName} – Profile | Crossy`,
    description: `Manage your profile information and settings for ${displayName}.`,
  };
}

export default async function UserPage({ params }: Props) {
  const { username } = await params;
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  // Fetch the current user's data to check their username
  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { username: true },
  });

  // If the URL username doesn't match the current user's username, redirect to their profile
  if (currentUser && currentUser.username !== username) {
    redirect(`/user/${currentUser.username}`);
  }

  const getCachedUser = unstable_cache(
    async (username: string) => {
      const user = await prisma.user.findUnique({
        where: { username },
        select: {
          id: true,
          email: true,
          fullName: true,
          username: true,
          avatar: true,
          isVerified: true,
          role: true,
          provider: true,
          providerId: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      if (!user) return null;
      return {
        ...user,
        id: user.id.toString(),
        role: user.role.toString(),
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      };
    },
    [`user-${username}`],
    { tags: [`user-${username}`], revalidate: 60 }
  );

  const user = await getCachedUser(username);
  if (!user) return notFound();

  return <UserProfile user={user} />;
}
