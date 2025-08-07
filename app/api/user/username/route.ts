import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/prisma/prisma-client';
import { revalidateTag } from 'next/cache';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { username, oldUsername } = await request.json();
  if (!username || username.length < 3) {
    return NextResponse.json(
      { error: 'Username must be at least 3 characters' },
      { status: 400 }
    );
  }

  try {
    // Check if username is already taken
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });
    if (existingUser && existingUser.id !== session.user.id) {
      return NextResponse.json(
        { error: 'Username already taken' },
        { status: 400 }
      );
    }

    // Update username
    await prisma.user.update({
      where: { id: session.user.id },
      data: { username },
    });

    // Invalidate cache for old and new usernames
    if (oldUsername) {
      revalidateTag(`user-${oldUsername}`);
    }
    revalidateTag(`user-${username}`);

    return NextResponse.json({ success: true, newUsername: username });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update username' },
      { status: 500 }
    );
  }
}
