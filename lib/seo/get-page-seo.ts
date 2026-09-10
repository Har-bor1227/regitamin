// lib/seo/get-page-seo.ts
import { cache } from 'react';
import { getPageBySlug } from '@/repositories/page-repository';
import { fetchSeoFromGraphQL } from '@/lib/seo/seo-repository';

const WORDPRESS_SITE_URL = process.env.NEXT_PUBLIC_WORDPRESS_SITE_URL || 'http://localhost:8080';

export const getPageSeo = cache(async (slug: string) => {
  const page = await getPageBySlug(slug);
  if (!page) return { page: null, seo: null };

  const wpPageUrl = page.uri ? `${WORDPRESS_SITE_URL}${page.uri}` : undefined;
  const seo = await fetchSeoFromGraphQL(String(page.databaseId), 'page', wpPageUrl);

  return { page, seo };
});