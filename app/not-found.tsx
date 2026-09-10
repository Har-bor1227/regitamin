import Link from 'next/link';
import { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Home, ShoppingCart, Phone } from 'lucide-react';

export const metadata: Metadata = {
  title: 'صفحه پیدا نشد | ۴۰۴',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'صفحه پیدا نشد',
            description: 'محتوای درخواستی یافت نشد.',
          }),
        }}
      />
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 px-4">
        <div className="text-center max-w-md">
          {/* Error code */}
          <h1 className="text-9xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
            ۴۰۴
          </h1>

          {/* Title */}
          <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
            صفحه مورد نظر یافت نشد!
          </h2>

          {/* Description */}
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            ممکن است این صفحه حذف شده یا آدرس آن تغییر کرده باشد.
          </p>

          <Separator className="my-8" />

          {/* Action buttons */}
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/">
              <Button size="lg" className="gap-2">
                <Home className="h-5 w-5" />
                صفحه اصلی
              </Button>
            </Link>
            <Link href="/shop">
              <Button size="lg" variant="outline" className="gap-2">
                <ShoppingCart className="h-5 w-5" />
                فروشگاه
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="gap-2">
                <Phone className="h-5 w-5" />
                تماس با ما
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}