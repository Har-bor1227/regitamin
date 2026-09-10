import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

export default function ShopLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      {/* Hero skeleton */}
      <section className="py-20 px-4 text-center">
        <Skeleton className="h-12 w-64 mx-auto rounded-lg" />
        <Skeleton className="h-6 w-96 mx-auto mt-4" />
        <Separator className="mt-8 max-w-xs mx-auto" />
      </section>

      {/* Main layout */}
      <div className="max-w-7xl mx-auto px-4 pb-20">
        <div className="flex gap-8">
          {/* Sidebar skeleton */}
          <aside className="hidden lg:block w-1/4">
            <div className="sticky top-24 space-y-4">
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-40 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          </aside>

          {/* Products grid skeleton */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-10 w-[180px]" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                  <Skeleton className="aspect-square w-full" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <div className="flex justify-between items-center pt-2">
                      <Skeleton className="h-5 w-20" />
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}