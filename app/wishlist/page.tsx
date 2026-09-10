import type { Metadata } from 'next';

import WishlistPageContent from '@/components/wishlist/wishlist-page-content';

export const metadata: Metadata = {
  title: 'علاقه‌مندی‌ها | رژیتامین',
  description: 'رژیم‌های ذخیره‌شده و علاقه‌مندی‌های شما',
  alternates: {
    canonical: '/wishlist',
  },
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = 'force-dynamic';

export default function WishlistPage() {
  return <WishlistPageContent />;
}