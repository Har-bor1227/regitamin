// app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { wooFetchPublic } from '@/lib/woocommerce';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ids = searchParams.get('ids');
  if (!ids) {
    return NextResponse.json({ products: [] });
  }
  try {
    const endpoint = `/products?include=${ids}&per_page=50`;
    const products = await wooFetchPublic<any>(endpoint);

    const response = NextResponse.json({ products });
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    return response;
  } catch (error) {
    return NextResponse.json({ products: [] }, { status: 500 });
  }
}