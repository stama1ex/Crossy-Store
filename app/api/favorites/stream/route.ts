import { NextResponse } from 'next/server';
import { prisma } from '@/prisma/prisma-client';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const shoeId = parseInt(searchParams.get('shoeId') || '0', 10);

  if (!shoeId) {
    return new NextResponse('Missing shoeId', { status: 400 });
  }

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      // Отправляем начальное количество лайков
      const totalFavorites = await prisma.favorite.count({ where: { shoeId } });
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ totalFavorites })}\n\n`)
      );

      // Имитация периодических обновлений (замените на реальную логику, например, через Prisma или Redis)
      const interval = setInterval(async () => {
        const newTotal = await prisma.favorite.count({ where: { shoeId } });
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ totalFavorites: newTotal })}\n\n`
          )
        );
      }, 5000); // Обновление каждые 5 секунд (настройте по необходимости)

      // Закрытие соединения при отключении клиента
      req.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
