import { Metadata } from 'next';
import { getAllPosts } from '@/repositories/post-repository';
import { getPageBySlug } from '@/repositories/page-repository';
import { fetchSeoFromGraphQL } from '@/lib/seo/seo-repository';
import { seoToMetadata } from '@/lib/seo/seo-to-metadata';
import { JsonLd } from '@/components/seo/JsonLd';
import { BreadcrumbSchema } from '@/components/seo/BreadcrumbSchema';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import BlogPageContent from '@/components/blog/blog-page-content';

export const revalidate = 3600;

const WORDPRESS_SITE_URL = process.env.NEXT_PUBLIC_WORDPRESS_SITE_URL || 'http://localhost:8080';
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const POSTS_PER_PAGE = 6;

type Props = {
  searchParams: Promise<{ after?: string }>;
};

async function getBlogPage() {
  let page = await getPageBySlug('blog');
  if (!page) page = await getPageBySlug('وبلاگ');
  return page;
}

function BlogPaginationLinks({ hasNextPage, endCursor }: { hasNextPage: boolean; endCursor: string | null }) {
  if (!hasNextPage || !endCursor) return null;
  return <link rel="next" href={`${BASE_URL}/blog?after=${encodeURIComponent(endCursor)}`} />;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { after } = await searchParams;
  const { pageInfo } = await getAllPosts(POSTS_PER_PAGE, after);

  const page = await getBlogPage();
  let metadata: Metadata;

  if (page) {
    const wpPageUrl = page.uri ? `${WORDPRESS_SITE_URL}${page.uri}` : undefined;
    const seo = await fetchSeoFromGraphQL(String(page.databaseId), 'page', wpPageUrl);
    if (seo) {
      metadata = seoToMetadata(seo);
    } else {
      metadata = {
        title: 'وبلاگ',
        description: 'آخرین مقالات و نوشته‌ها',
        alternates: { canonical: '/blog' },
        robots: { index: true, follow: true },
      };
    }
  } else {
    metadata = {
      title: 'وبلاگ',
      description: 'آخرین مقالات و نوشته‌ها',
      alternates: { canonical: '/blog' },
      robots: { index: true, follow: true },
    };
  }

  return metadata;
}

export default async function BlogPage({ searchParams }: Props) {
  const { after } = await searchParams;
  const { posts, pageInfo } = await getAllPosts(POSTS_PER_PAGE, after);

  // SEO & JSON‑LD
  const page = await getBlogPage();
  const wpPageUrl = page?.uri ? `${WORDPRESS_SITE_URL}${page.uri}` : undefined;
  const seo = page ? await fetchSeoFromGraphQL(String(page.databaseId), 'page', wpPageUrl) : null;

  // Breadcrumb
  const breadcrumbItems = [
    { name: 'خانه', url: '/' },
    { name: page?.title || 'وبلاگ' },
  ];
  const nextPageUrl = pageInfo.hasNextPage
    ? `/blog?after=${encodeURIComponent(pageInfo.endCursor!)}`
    : null;

  return (
    <>
      <BlogPaginationLinks hasNextPage={pageInfo.hasNextPage} endCursor={pageInfo.endCursor} />
      {seo && <JsonLd seo={seo} />}
      <BreadcrumbSchema items={breadcrumbItems} />

      <div className="max-w-7xl mx-auto px-4 py-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">خانه</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{page?.title || 'وبلاگ'}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <BlogPageContent
        posts={posts}
        pageInfo={pageInfo}
        nextPageUrl={nextPageUrl}
        after={after}
      />
    </>
  );
}