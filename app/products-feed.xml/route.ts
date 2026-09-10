import { getLatestProducts } from '@/repositories/product-repository';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export async function GET() {
  const products = await getLatestProducts(50);

  const rssItems = products
    .map(
      (product) => `
    <item>
      <title><![CDATA[${product.name}]]></title>
      <link>${SITE_URL}/product/${product.slug}</link>
      <guid isPermaLink="true">${SITE_URL}/product/${product.slug}</guid>
      <description><![CDATA[${product.shortDescription?.replace(/<[^>]+>/g, '') || ''}]]></description>
      <pubDate>${new Date().toUTCString()}</pubDate>
      <price>${product.price}</price>
    </item>`
    )
    .join('');

  const rssFeed = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>محصولات جدید DOT</title>
    <link>${SITE_URL}/shop</link>
    <description>جدیدترین محصولات فروشگاه ساینده‌های سنگ</description>
    <language>fa</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/products-feed.xml" rel="self" type="application/rss+xml"/>
    ${rssItems}
  </channel>
</rss>`;

  return new Response(rssFeed, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}