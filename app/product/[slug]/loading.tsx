import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

export default function ProductLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Breadcrumb skeleton */}
        <div className="flex items-center gap-2 mb-8">
          <Skeleton className="h-4 w-10" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-14" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-24" />
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Gallery skeleton */}
          <div>
            <Skeleton className="aspect-square w-full rounded-2xl" />
            <div className="flex gap-2 mt-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="w-20 h-20 rounded-lg" />
              ))}
            </div>
          </div>

          {/* Product info skeleton */}
          <div className="space-y-6">
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>

            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-20 w-full" />

            {/* Variation skeletons */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <div className="flex gap-2">
                <Skeleton className="h-10 w-16 rounded-lg" />
                <Skeleton className="h-10 w-16 rounded-lg" />
                <Skeleton className="h-10 w-16 rounded-lg" />
              </div>
            </div>

            {/* Price skeleton */}
            <Skeleton className="h-10 w-40" />
            <Separator />

            {/* Add to cart skeleton */}
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-32 rounded-lg" />
              <Skeleton className="h-12 flex-1 rounded-lg" />
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          </div>
        </div>

        {/* Tabs skeleton */}
        <div className="mt-16">
          <div className="flex gap-4 border-b dark:border-gray-700">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
          <div className="py-6 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    </div>
  );
}