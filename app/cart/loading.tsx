import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

export default function CartLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <Skeleton className="h-10 w-40 mb-8" />

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart items skeleton */}
          <div className="lg:col-span-2 space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-200 dark:border-gray-800"
              >
                <Skeleton className="w-20 h-20 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded" />
                  <Skeleton className="h-4 w-8" />
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              </div>
            ))}
          </div>

          {/* Summary skeleton */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
              <Skeleton className="h-6 w-28 mb-4" />
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <Separator />
                <div className="flex justify-between">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-24" />
                </div>
              </div>
              <div className="mt-6 space-y-3">
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
              <Separator className="my-4" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}