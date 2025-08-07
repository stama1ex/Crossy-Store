import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Для настоящего продакшена здесь нужна полноценная загрузка (например, в S3, Cloudinary или диск)
// Сейчас — заглушка, которая просто возвращает URL-заглушку

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('avatar');

  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  // Здесь должен быть код сохранения файла (например, в облако или файловую систему)

  // Для примера — возвращаем фейковый URL или можно base64
  const avatarUrl = '/default-avatar.png'; // заменить на реально сохранённый URL

  return NextResponse.json({ avatarUrl });
}
