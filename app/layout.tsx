import type { Metadata, Viewport } from 'next';
import './globals.css';
import localFont from 'next/font/local';

import { AuthProvider } from '@/providers/auth-provider';
import { CartProvider } from '@/providers/cart-provider';
import { WishlistProvider } from '@/providers/wishlist-provider';

import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Toaster } from 'sonner';
import { OrganizationSchema } from '@/components/seo/organization-schema';

const estedad = localFont({
  src: [
    {
      path: '../public/fonts/Estedad-VF.woff2',
      style: 'normal',
      weight: '100 900',
    },
  ],
  variable: '--font-estedad',
  display: 'swap',
  preload: true,
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: 'رژیتامین | فروشگاه تخصصی محصولات سلامت و زیبایی',
    template: '%s | رژیتامین',
  },

  description:
    'رژیتامین؛ فروشگاه اینترنتی محصولات سلامت، مکمل، مراقبت و زیبایی با ارائه محصولات معتبر و باکیفیت.',

  applicationName: 'رژیتامین',

  keywords: [
    'رژیتامین',
    'مکمل',
    'محصولات سلامت',
    'محصولات زیبایی',
    'ویتامین',
    'مراقبت پوست',
    'مراقبت مو',
    'فروشگاه آنلاین',
  ],

  authors: [{ name: 'رژیتامین' }],
  creator: 'رژیتامین',
  publisher: 'رژیتامین',

  robots: {
    index: true,
    follow: true,
  },

  openGraph: {
    type: 'website',
    locale: 'fa_IR',
    url: SITE_URL,
    siteName: 'رژیتامین',
    title: 'رژیتامین | فروشگاه تخصصی محصولات سلامت و زیبایی',
    description:
      'خرید آنلاین محصولات سلامت، مکمل و مراقبت با تجربه‌ای سریع و مطمئن.',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'رژیتامین',
    description:
      'فروشگاه اینترنتی محصولات سلامت، مکمل و زیبایی',
  },

  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#FFFFFF',
};

const organizationData = {
  name: 'رژیتامین',
  url:
    process.env.NEXT_PUBLIC_WORDPRESS_SITE_URL ||
    'https://www.rejitamin.com',
  logo: '/logo.png',
  sameAs: [],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fa"
      dir="rtl"
      className={estedad.variable}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <OrganizationSchema org={organizationData} />

        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <div className="flex min-h-screen flex-col">
                <Header />

                <main className="min-w-0 flex-1 pt-[116px] md:pt-[116px]">
                  {children}
                </main>

                <Footer />
              </div>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>

        <Toaster
          position="bottom-left"
          richColors
          closeButton
          dir="rtl"
          toastOptions={{
            classNames: {
              toast:
                'font-sans rounded-2xl border-border shadow-lg',
            },
          }}
        />
      </body>
    </html>
  );
}