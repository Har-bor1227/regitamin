import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/wp-admin/',
        '/cart',
        '/checkout',
        '/account',
        '/auth/',
        '/payment/',
        '/wishlist',
        '/api/',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}