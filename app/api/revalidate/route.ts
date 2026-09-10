// app/api/revalidate/route.ts
import { revalidateTag, revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

const SECRET = process.env.REVALIDATION_SECRET || 'your-secret-here';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { secret, tag, path } = body;

    if (secret !== SECRET) {
      return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
    }

    if (tag) {
      revalidateTag(tag);
    }
    if (path) {
      revalidatePath(path);
    }

    return NextResponse.json({ revalidated: true, tag, path });
  } catch (error) {
    return NextResponse.json({ error: 'Error revalidating' }, { status: 500 });
  }
}