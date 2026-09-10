// app/sitemap.xml/route.ts
import { getAllPostsForSitemap } from '@/repositories/post-repository';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const WC_API = process.env.WOOCOMMERCE_API_URL || 'http://localhost:8080/wp-json/wc/v3';

let cachedSitemap: string | null = null;
let lastFetched = 0;
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 ساعت

async function fetchAllProducts(): Promise<any[]> {
  let allProducts: any[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    try {
      const res = await fetch(`${WC_API}/products?per_page=100&page=${page}&status=publish`);
      if (!res.ok) {
        hasMore = false;
        break;
      }
      const products = await res.json();
      if (!Array.isArray(products) || products.length === 0) {
        hasMore = false;
        break;
      }
      allProducts = [...allProducts, ...products];

      const linkHeader = res.headers.get('Link');
      if (!linkHeader || !linkHeader.includes('rel="next"')) {
        hasMore = false;
      } else {
        page++;
      }
    } catch (error) {
      console.warn('Sitemap: Error fetching products page', page, error);
      hasMore = false;
    }
  }

  return allProducts;
}

export async function GET() {
  const now = Date.now();
  if (cachedSitemap && (now - lastFetched) < CACHE_TTL) {
    return new Response(cachedSitemap, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    });
  }

  const staticPages = [
    { url: BASE_URL, lastmod: new Date().toISOString(), changefreq: 'weekly', priority: '1.0' },
    { url: `${BASE_URL}/shop`, lastmod: new Date().toISOString(), changefreq: 'daily', priority: '0.9' },
    { url: `${BASE_URL}/blog`, lastmod: new Date().toISOString(), changefreq: 'daily', priority: '0.9' },
    { url: `${BASE_URL}/about`, lastmod: new Date().toISOString(), changefreq: 'monthly', priority: '0.7' },
    { url: `${BASE_URL}/contact`, lastmod: new Date().toISOString(), changefreq: 'monthly', priority: '0.7' },
  ];

  let productUrls = '';
  try {
    const products = await fetchAllProducts();
    productUrls = products.map((p: any) =>
      `<url>
        <loc>${BASE_URL}/product/${p.slug}</loc>
        <lastmod>${p.date_modified || new Date().toISOString()}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
      </url>`
    ).join('');
  } catch (error) {
    console.warn('Sitemap: Could not fetch products', error);
  }

  let postUrls = '';
  try {
    const posts = await getAllPostsForSitemap();
    postUrls = posts.map((post) =>
      `<url>
        <loc>${BASE_URL}/blog/${post.slug}</loc>
        <lastmod>${post.modified}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
      </url>`
    ).join('');
  } catch (error) {
    console.warn('Sitemap: Could not fetch blog posts', error);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticPages.map(p => `<url><loc>${p.url}</loc><lastmod>${p.lastmod}</lastmod><changefreq>${p.changefreq}</changefreq><priority>${p.priority}</priority></url>`).join('')}
  ${productUrls}
  ${postUrls}
</urlset>`;

  cachedSitemap = xml;
  lastFetched = now;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}