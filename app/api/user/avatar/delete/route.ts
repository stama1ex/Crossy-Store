import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/prisma/prisma-client';
import { cloudinary } from '@/lib/cloudinary';
import { revalidateTag } from 'next/cache';

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Fetch current user data
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { avatar: true, username: true },
    });

    // Delete avatar from Cloudinary if it exists
    if (user?.avatar) {
      try {
        await cloudinary.uploader.destroy(user.avatar, {
          invalidate: true,
          resource_type: 'image',
        });
      } catch (destroyError) {
        console.warn('Failed to delete avatar from Cloudinary:', destroyError);
      }
    }

    // Update user in database
    await prisma.user.update({
      where: { id: session.user.id },
      data: { avatar: null },
    });

    // Revalidate cache
    if (user?.username) {
      revalidateTag(`user-${user.username}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete avatar:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to delete avatar',
      },
      { status: 500 }
    );
  }
}
