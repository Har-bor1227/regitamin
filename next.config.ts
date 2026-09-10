// next.config.ts

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /**
   * =========================================================
   * CORE
   * =========================================================
   */

  reactStrictMode: true,

  /*
   * Next.js به‌صورت پیش‌فرض compression دارد.
   * آن را فعال نگه می‌داریم.
   */
  compress: true,

  /*
   * اطلاعاتی مثل:
   * X-Powered-By: Next.js
   *
   * بهتر است در Production ارسال نشود.
   */
  poweredByHeader: false,

  /**
   * =========================================================
   * IMAGE OPTIMIZATION
   * =========================================================
   *
   * منبع اصلی تصاویر:
   *
   * rejitamin.com
   * www.rejitamin.com
   *
   * آواتار نویسنده:
   *
   * secure.gravatar.com
   */

  images: {
    /*
     * فقط مسیر موردنیاز WordPress مجاز است.
     */
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'rejitamin.com',
        port: '',
        pathname: '/wp-content/uploads/**',
      },

      {
        protocol: 'https',
        hostname: 'www.rejitamin.com',
        port: '',
        pathname: '/wp-content/uploads/**',
      },

      /*
       * Gravatar
       *
       * Query string در Gravatar متغیر است:
       * ?s=96&d=mm&r=g
       *
       * بنابراین search را محدود نمی‌کنیم.
       */
      {
        protocol: 'https',
        hostname: 'secure.gravatar.com',
        port: '',
        pathname: '/avatar/**',
      },

      /*
       * توسعه لوکال WordPress
       */
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8080',
        pathname: '/wp-content/uploads/**',
      },
    ],

    /*
     * فرمت‌های مدرن
     */
    formats: [
      'image/webp',
      'image/avif',
    ],

    /*
     * اندازه‌های واقعی Responsive
     *
     * از تولید سایزهای غیرضروری کم می‌کنیم.
     */
    deviceSizes: [
      360,
      480,
      640,
      750,
      828,
      1080,
      1200,
      1440,
      1920,
    ],

    imageSizes: [
      32,
      48,
      64,
      96,
      128,
      192,
      256,
      384,
    ],

    /*
     * تصاویر remote مدتی در cache نگه داشته شوند
     * تا درخواست‌های تکراری کمتر شوند.
     */
    minimumCacheTTL: 60 * 60 * 24,
  },

  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    /*
     * TypeScript همچنان باید در Build بررسی شود.
     */
    ignoreBuildErrors: false,
  },
  async headers() {
    return [
      {
        source: '/(.*)',

        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },

          /*
           * HSTS
           *
           * این header برای دامنه Production HTTPS است.
           */
          {
            key: 'Strict-Transport-Security',
            value:
              'max-age=63072000; includeSubDomains; preload',
          },

          /*
           * جلوگیری از iframe شدن
           */
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },

          /*
           * جلوگیری از MIME sniffing
           */
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },

          /*
           * Referrer
           */
          {
            key: 'Referrer-Policy',
            value:
              'strict-origin-when-cross-origin',
          },

          /*
           * Browser APIs
           */
          {
            key: 'Permissions-Policy',
            value:
              'camera=(), microphone=(), geolocation=(), payment=()',
          },
          {
            key: 'Content-Security-Policy',
            value:
              [
                "default-src 'self'",

                /*
                 * Next / React
                 */
                "script-src 'self' 'unsafe-inline' 'unsafe-eval'",

                /*
                 * Tailwind / Shadcn / inline styles
                 */
                "style-src 'self' 'unsafe-inline'",

                /*
                 * تصاویر
                 */
                [
                  "img-src",
                  "'self'",
                  'data:',
                  'blob:',
                  'https://rejitamin.com',
                  'https://www.rejitamin.com',
                  'https://secure.gravatar.com',
                ].join(' '),

                /*
                 * فونت‌ها
                 */
                "font-src 'self' data:",
                [
                  "connect-src",
                  "'self'",
                  'https://rejitamin.com',
                  'https://www.rejitamin.com',
                ].join(' '),

                /*
                 * فرم‌ها فقط به خود سایت
                 */
                "form-action 'self'",

                /*
                 * جلوگیری از frame شدن
                 */
                "frame-ancestors 'none'",

                /*
                 * محدود کردن base URI
                 */
                "base-uri 'self'",

                /*
                 * object/embed بلاک
                 */
                "object-src 'none'",

                /*
                 * جلوگیری از upgrade ناخواسته HTTP
                 */
                'upgrade-insecure-requests',
              ].join('; '),
          },

          /*
           * Preconnect به WordPress
           */
          {
            key: 'Link',
            value:
              [
                '<https://rejitamin.com>; rel=preconnect',
                '<https://secure.gravatar.com>; rel=preconnect',
              ].join(', '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;