import type { Metadata } from 'next';
import { Suspense } from 'react';

import LoginPageContent from '@/components/auth/login-page-content';

export const metadata: Metadata = {
  title: 'ورود و ثبت‌نام | رژیتامین',
  description: 'ورود و ثبت‌نام در رژیتامین با شماره موبایل',
  alternates: {
    canonical: '/auth/login',
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  );
}