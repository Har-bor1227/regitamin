import { getAllPosts } from '@/repositories/post-repository';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export async function GET() {
  // دریافت ۵۰ پست اول (برای فید RSS کافی است)
  const { posts } = await getAllPosts(50);

  const rssItems = posts
    .map(
      (post) => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${SITE_URL}/blog/${post.slug}</link>
      <guid isPermaLink="true">${SITE_URL}/blog/${post.slug}</guid>
      <description><![CDATA[${post.excerpt?.replace(/<[^>]+>/g, '') || ''}]]></description>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      ${post.author ? `<author>${post.author.name}</author>` : ''}
    </item>`
    )
    .join('');

  const rssFeed = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>وبلاگ DOT</title>
    <link>${SITE_URL}/blog</link>
    <description>آخرین مقالات فروشگاه ساینده‌های سنگ</description>
    <language>fa</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
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