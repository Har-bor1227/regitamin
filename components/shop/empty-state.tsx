'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { SearchX, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function EmptyState() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const hasFilters =
    searchParams.has('search') ||
    searchParams.has('category') ||
    searchParams.has('min_price') ||
    searchParams.has('max_price');

  const handleReset = () => {
    router.push('/shop');
  };

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
        <SearchX className="h-12 w-12 text-gray-400" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
        محصولی یافت نشد
      </h3>
      <p className="mt-2 max-w-md text-gray-500 dark:text-gray-400">
        {hasFilters
          ? 'هیچ محصولی با فیلترهای انتخاب‌شده پیدا نکردیم. می‌توانید فیلترها را تغییر دهید یا بازنشانی کنید.'
          : 'در حال حاضر محصولی در فروشگاه وجود ندارد. لطفاً بعداً مراجعه کنید.'}
      </p>
      {hasFilters && (
        <Button variant="outline" size="lg" className="mt-6 gap-2" onClick={handleReset}>
          <RotateCcw className="h-5 w-5" />
          بازنشانی فیلترها
        </Button>
      )}
    </div>
  );
}