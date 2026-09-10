
import type { Metadata } from 'next';

import {
  getLatestProducts,
} from '@/repositories/product-repository';

import { getPageBySlug } from '@/repositories/page-repository';
import { getAllPosts } from '@/repositories/post-repository';

import { getPageSeo } from '@/lib/seo/get-page-seo';
import { seoToMetadata } from '@/lib/seo/seo-to-metadata';
import { JsonLd } from '@/components/seo/JsonLd';

import HomePageContent from '@/components/home/home-page-content';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const { seo } = await getPageSeo('home');

  if (seo) {
    return seoToMetadata(seo);
  }

  return {
    title: 'رژیتامین | فروشگاه تخصصی محصولات سلامت و زیبایی',
    description:
      'خرید آنلاین محصولات سلامت، مکمل، مراقبت و زیبایی از رژیتامین.',
  };
}

export default async function HomePage() {
  const [
    latestProducts,
    aboutPage,
    postsResult,
    homeSeo,
  ] = await Promise.all([
    getLatestProducts(8),
    getPageBySlug('درباره-ما').catch(() => null),

    // قبلاً 3 بود؛ برای نمایش 6 مقاله باید واقعاً 6 مقاله دریافت شود.
    getAllPosts(6),

    getPageSeo('home'),
  ]);

  return (
    <>
      {homeSeo.seo && (
        <JsonLd seo={homeSeo.seo} />
      )}

      <HomePageContent
        popularProducts={latestProducts}
        aboutPage={aboutPage}
        recentPosts={postsResult.posts}
      />
    </>
  );
}
