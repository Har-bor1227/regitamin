import { Skeleton } from '@/components/ui/skeleton';

export default function AccountLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <Skeleton className="h-10 w-40 mb-8" />

        {/* Tab skeleton */}
        <div className="flex border-b border-gray-200 dark:border-gray-800 mb-8">
          <Skeleton className="h-10 w-20 mx-2" />
          <Skeleton className="h-10 w-20 mx-2" />
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-32 mb-4" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}