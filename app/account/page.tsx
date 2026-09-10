import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import AccountPageContent from '@/components/account/account-page-content';

export const metadata: Metadata = {
  title: 'حساب کاربری | رژیتامین',
  description: 'مدیریت حساب کاربری و سفارش‌های شما',
  alternates: {
    canonical: '/account',
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AccountPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    redirect('/auth/login?redirect=/account');
  }

  return <AccountPageContent />;
}