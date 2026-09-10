import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import CheckoutPageContent from '@/components/checkout/checkout-page-content';
import { verifyToken } from '@/lib/auth-utils';

export const metadata: Metadata = {
  title: 'تکمیل سفارش | رژیتامین',
  description: 'تکمیل سفارش و پرداخت',
  alternates: {
    canonical: '/checkout',
  },
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = 'force-dynamic';

export default async function CheckoutPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    redirect('/auth/login?redirect=/checkout');
  }

  const payload = await verifyToken(token);

  if (!payload?.phone) {
    redirect('/auth/login?redirect=/checkout');
  }

  return <CheckoutPageContent />;
}