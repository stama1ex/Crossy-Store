import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/prisma/prisma-client';
import { authOptions } from '@/lib/auth';

export async function DELETE(req: Request) {
  try {
    console.time('clearFavorites');
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.log('Unauthorized access');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = await req.json();
    if (Number(session.user.id) !== userId) {
      console.log('User ID mismatch');
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    console.log(`Clearing favorites for userId: ${userId}`);

    // Получаем shoeIds для пересчёта likeCounts
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      select: { shoeId: true }, // Запрашиваем только shoeId, чтобы минимизировать запрос
    });

    const shoeIds = favorites.map((fav) => fav.shoeId);

    // Удаляем все избранные записи
    await prisma.favorite.deleteMany({
      where: { userId },
    });

    // Пересчитываем likeCounts
    const likeCounts: Record<number, number> = {};
    for (const shoeId of shoeIds) {
      const count = await prisma.favorite.count({ where: { shoeId } });
      likeCounts[shoeId] = count;
    }

    console.log(
      `Cleared favorites for userId: ${userId}, updated likeCounts:`,
      likeCounts
    );
    console.timeEnd('clearFavorites');

    // Возвращаем пустой массив favorites
    return NextResponse.json({ favorites: [], likeCounts });
  } catch (error) {
    console.error('Clear favorites error:', error);
    return NextResponse.json(
      { error: 'Failed to clear favorites' },
      { status: 500 }
    );
  }
}
