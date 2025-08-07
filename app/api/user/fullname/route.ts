import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/prisma/prisma-client';
import { revalidateTag } from 'next/cache';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { fullName } = await request.json();
  if (fullName && fullName.length < 2) {
    return NextResponse.json(
      { error: 'Full name must be at least 2 characters' },
      { status: 400 }
    );
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: Number(session.user.id) },
      data: { fullName: fullName || null },
      select: { fullName: true, username: true }, // Include username for cache invalidation
    });

    // Invalidate cache for the user's profile only if username exists
    if (updatedUser.username) {
      revalidateTag(`user-${updatedUser.username}`);
    }

    return NextResponse.json(
      { success: true, fullName: updatedUser.fullName },
      {
        headers: {
          'Cache-Control':
            'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('Failed to update full name:', error);
    return NextResponse.json(
      { error: 'Failed to update full name' },
      { status: 500 }
    );
  }
}
