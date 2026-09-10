import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPostBySlug } from '@/repositories/post-repository';
import { fetchSeoFromGraphQL } from '@/lib/seo/seo-repository';
import { seoToMetadata } from '@/lib/seo/seo-to-metadata';
import { JsonLd } from '@/components/seo/JsonLd';
import { BreadcrumbSchema } from '@/components/seo/BreadcrumbSchema';
import BlogPostContent from '@/components/blog/blog-post-content';

export const revalidate = 3600;

type Props = {
  params: Promise<{ slug: string }>;
};

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const WORDPRESS_SITE_URL = process.env.NEXT_PUBLIC_WORDPRESS_SITE_URL || 'http://localhost:8080';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: 'مقاله پیدا نشد' };

  const wpPostUrl = post.uri ? `${WORDPRESS_SITE_URL}${post.uri}` : undefined;
  const seo = await fetchSeoFromGraphQL(String(post.databaseId), 'post', wpPostUrl);

  const fallbackDescription = post.excerpt?.replace(/<[^>]+>/g, '').slice(0, 160) || post.title;

  if (seo) {
    if (!seo.description) seo.description = fallbackDescription;
    if (!seo.openGraph?.description)
      seo.openGraph = { ...seo.openGraph, description: seo.openGraph?.description || seo.description };
    if (!seo.twitter?.description)
      seo.twitter = { ...seo.twitter, description: seo.twitter?.description || seo.openGraph?.description || seo.description };
    if (!seo.openGraph?.image && post.featuredImage)
      seo.openGraph = {
        ...seo.openGraph,
        image: {
          url: new URL(post.featuredImage.url, BASE_URL).toString(),
          alt: post.featuredImage.alt || post.title,
        },
      };
    return seoToMetadata(seo);
  }

  // fallback بدون robots (تا noindex احتمالی وردپرس از بین نرود)
  return {
    title: post.title,
    description: fallbackDescription,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: fallbackDescription,
      url: `${BASE_URL}/blog/${post.slug}`,
      images: post.featuredImage
        ? [{ url: new URL(post.featuredImage.url, BASE_URL).toString(), alt: post.featuredImage.alt || post.title }]
        : [],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) notFound();

  const wpPostUrl = post.uri ? `${WORDPRESS_SITE_URL}${post.uri}` : undefined;
  const seo = await fetchSeoFromGraphQL(String(post.databaseId), 'post', wpPostUrl);

  const breadcrumbItems = [
    { name: 'خانه', url: '/' },
    { name: 'وبلاگ', url: '/blog' },
    { name: post.title },
  ];

  return (
    <>
      <BreadcrumbSchema items={breadcrumbItems} />
      {seo && <JsonLd seo={seo} />}
      <BlogPostContent post={post} />
    </>
  );
}