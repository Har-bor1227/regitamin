import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth-utils';
import { getServerCart, setServerCart } from '@/lib/cart-store';

export async function GET(request: NextRequest) {
  // احراز هویت با JWT از کوکی
  const token = request.cookies.get('auth_token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const payload = await verifyToken(token);
  if (!payload || !payload.phone) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const cart = getServerCart(payload.phone);
  return NextResponse.json({ cart });
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
    const items = body.items;
    if (!Array.isArray(items)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }
    setServerCart(payload.phone, items);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}