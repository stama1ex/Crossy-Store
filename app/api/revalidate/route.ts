// app/api/revalidate/route.ts
import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

export async function POST(request: Request) {
  const url = new URL(request.url);
  const tag = url.searchParams.get('tag');

  if (!tag) {
    return NextResponse.json({ error: 'Missing tag' }, { status: 400 });
  }

  try {
    revalidateTag(tag);
    return NextResponse.json(
      { message: `Revalidated tag: ${tag}` },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error revalidating tag:', error);
    return NextResponse.json(
      { error: 'Failed to revalidate tag' },
      { status: 500 }
    );
  }
}
