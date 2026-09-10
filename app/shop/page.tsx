// app/shop/page.tsx
import { Metadata } from 'next';
import { getProducts } from '@/repositories/product-repository';
import { getCategories } from '@/repositories/category-repository';
import { getPageSeo } from '@/lib/seo/get-page-seo';
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
import ShopPageContent from '@/components/shop/shop-page-content';

export const revalidate = 3600;

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const PER_PAGE = 12;
const PRICE_RANGE: [number, number] = [0, 50000000];

type Props = {
  searchParams: Promise<{
    page?: string;
    search?: string;
    category?: string;
    min_price?: string;
    max_price?: string;
    orderby?: string;
  }>;
};

function buildPageUrl(
  page: number,
  search?: string,
  category?: string,
  minPrice?: number,
  maxPrice?: number,
  orderby?: string
) {
  const newParams = new URLSearchParams();
  if (search) newParams.set('search', search);
  if (category) newParams.set('category', category);
  if (minPrice !== undefined) newParams.set('min_price', String(minPrice));
  if (maxPrice !== undefined) newParams.set('max_price', String(maxPrice));
  if (orderby && orderby !== 'date') newParams.set('orderby', orderby);
  if (page > 1) newParams.set('page', String(page));
  const query = newParams.toString();
  return `/shop${query ? `?${query}` : ''}`;
}

function PaginationLinks({
  currentPage,
  totalPages,
  search,
  category,
  minPrice,
  maxPrice,
  orderby,
}: {
  currentPage: number;
  totalPages: number;
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  orderby?: string;
}) {
  if (totalPages <= 1) return null;
  return (
    <>
      {currentPage > 1 && (
        <link rel="prev" href={`${BASE_URL}${buildPageUrl(currentPage - 1, search, category, minPrice, maxPrice, orderby)}`} />
      )}
      {currentPage < totalPages && (
        <link rel="next" href={`${BASE_URL}${buildPageUrl(currentPage + 1, search, category, minPrice, maxPrice, orderby)}`} />
      )}
    </>
  );
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { page, seo } = await getPageSeo('shop');

  if (seo) {
    return seoToMetadata(seo);
  }

  return {
    title: page?.title || 'فروشگاه',
    description: 'فروشگاه ساینده‌های سنگ DOT',
    alternates: { canonical: '/shop' },
    robots: { index: true, follow: true },
  };
}

export default async function ShopPage({ searchParams }: Props) {
  const params = await searchParams;

  const currentPage = params.page ? parseInt(params.page, 10) : 1;
  const search = params.search || '';
  const category = params.category || '';
  const minPrice = params.min_price ? Number(params.min_price) : undefined;
  const maxPrice = params.max_price ? Number(params.max_price) : undefined;
  const orderby = params.orderby || 'date';

  const { products, total, totalPages } = await getProducts({
    page: currentPage,
    perPage: PER_PAGE,
    search,
    category,
    minPrice,
    maxPrice,
    orderby,
  });

  const categories = await getCategories();

  const { page, seo } = await getPageSeo('shop');

  const breadcrumbItems = [
    { name: 'خانه', url: '/' },
    { name: page?.title || 'فروشگاه' },
  ];

  return (
    <>
      <PaginationLinks
        currentPage={currentPage}
        totalPages={totalPages}
        search={search || undefined}
        category={category || undefined}
        minPrice={minPrice}
        maxPrice={maxPrice}
        orderby={orderby !== 'date' ? orderby : undefined}
      />
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
              <BreadcrumbPage>{page?.title || 'فروشگاه'}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <ShopPageContent
        products={products}
        currentPage={currentPage}
        totalPages={totalPages}
        total={total}
        categories={categories}
        initialSearch={search}
        initialMinPrice={minPrice}
        initialMaxPrice={maxPrice}
        initialCategory={category ? Number(category) : null}
        initialOrderby={orderby}
        priceRange={PRICE_RANGE}
      />
    </>
  );
}