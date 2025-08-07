import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/prisma/prisma-client';
import { cloudinary } from '@/lib/cloudinary';
import { revalidateTag } from 'next/cache';
import { UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('avatar') as File;

  // Validate file
  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json(
      { error: 'Only JPEG, PNG, GIF, or WebP images are allowed' },
      { status: 400 }
    );
  }

  // Validate file size (2MB limit)
  if (file.size > 2 * 1024 * 1024) {
    return NextResponse.json(
      { error: 'Image size must be less than 2MB' },
      { status: 400 }
    );
  }

  try {
    // Fetch current user data
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { avatar: true, username: true },
    });

    // Delete old avatar from Cloudinary if it exists
    if (user?.avatar) {
      try {
        await cloudinary.uploader.destroy(user.avatar, {
          invalidate: true,
          resource_type: 'image',
        });
      } catch (destroyError) {
        console.warn('Failed to delete old avatar:', destroyError);
      }
    }

    // Generate public_id
    const publicId = `${session.user.id}-${Date.now()}`;

    // Convert file to stream for upload
    const buffer = Buffer.from(await file.arrayBuffer());
    const stream = Readable.from(buffer);

    // Upload to Cloudinary with optimizations
    const uploadResult: UploadApiResponse = await new Promise(
      (resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'avatars',
            public_id: publicId,
            overwrite: true,
            resource_type: 'image',
            fetch_format: 'auto',
            quality: 'auto',
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result as UploadApiResponse);
          }
        );
        stream.pipe(uploadStream);
      }
    );

    // Update user in database with public_id
    await prisma.user.update({
      where: { id: session.user.id },
      data: { avatar: publicId },
    });

    // Revalidate cache
    if (user?.username) {
      revalidateTag(`user-${user.username}`);
    }

    return NextResponse.json({
      success: true,
      avatarUrl: uploadResult.secure_url,
      publicId,
    });
  } catch (error) {
    console.error('Avatar upload failed:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to upload avatar',
      },
      { status: 500 }
    );
  }
}
