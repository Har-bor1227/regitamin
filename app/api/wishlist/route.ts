import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth-utils';
import { getServerWishlist, setServerWishlist } from '@/lib/wishlist-store';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const payload = await verifyToken(token);
  if (!payload || !payload.phone) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const wishlist = getServerWishlist(payload.phone);
  return NextResponse.json({ wishlist });
}

export async function PUT(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const payload = await verifyToken(token);
  if (!payload || !payload.phone) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const ids = body.ids;
    if (!Array.isArray(ids)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }
    setServerWishlist(payload.phone, ids);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}