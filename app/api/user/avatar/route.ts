import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/prisma/prisma-client';
import { cloudinary } from '@/lib/cloudinary';
import { revalidateTag } from 'next/cache';
import { UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

export async function POST(request: Request) {
  // Проверка аутентификации
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Получение файла из запроса
  const formData = await request.formData();
  const file = formData.get('avatar') as File;

  // Валидация файла
  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json(
      { error: 'Only JPEG, PNG, GIF, or WebP images are allowed' },
      { status: 400 }
    );
  }

  if (file.size > 2 * 1024 * 1024) {
    return NextResponse.json(
      { error: 'Image size must be less than 2MB' },
      { status: 400 }
    );
  }

  try {
    // Получение данных пользователя
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { avatar: true, username: true },
    });

    // Удаление старого аватара из Cloudinary
    if (user?.avatar) {
      try {
        await cloudinary.uploader.destroy(`avatars/${user.avatar}`, {
          invalidate: true,
          resource_type: 'image',
        });
      } catch (destroyError) {
        console.warn(
          'Failed to delete old avatar from Cloudinary:',
          destroyError
        );
      }
    }

    // Генерация public_id
    const publicId = `${session.user.id}-${Date.now()}`.replace(
      /[^a-zA-Z0-9-_]/g,
      ''
    );

    // Конвертация файла в поток
    const buffer = Buffer.from(await file.arrayBuffer());
    const stream = Readable.from(buffer);

    // Загрузка в Cloudinary
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

    // Проверка успешности загрузки
    if (!uploadResult.secure_url) {
      throw new Error('Failed to upload image to Cloudinary');
    }

    // Логирование URL для отладки
    console.log('Uploaded image URL:', uploadResult.secure_url);

    // Формирование URL с трансформациями
    const avatarUrl = `https://res.cloudinary.com/dcxsimayu/image/upload/c_auto,w_256,h_256,g_auto/c_limit,w_256/f_auto/q_auto/v1/avatars/${publicId}`;

    // Проверка сформированного URL
    console.log('Transformed avatar URL:', avatarUrl);

    // Обновление пользователя в базе данных
    await prisma.user.update({
      where: { id: session.user.id },
      data: { avatar: publicId },
    });

    // Очистка кэша
    if (user?.username) {
      revalidateTag(`user-${user.username}`);
    }

    // Возврат ответа
    return NextResponse.json({
      success: true,
      avatarUrl,
      publicId,
      fullPath: `avatars/${publicId}`,
    });
  } catch (error) {
    console.error('Avatar upload failed:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to upload avatar',
      },
      { status: 500 }
    );
  }
}
