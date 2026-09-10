// app/product/[slug]/page.tsx

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import {
  getProductBySlug,
  getRelatedProducts,
} from '@/repositories/product-repository';

import ProductPageContent from '@/components/shop/product-page-content';

import { BreadcrumbSchema } from '@/components/seo/BreadcrumbSchema';
import { ProductSchema } from '@/components/seo/ProductSchema';

import {
  getPageSeo,
} from '@/lib/seo/get-page-seo';

import {
  seoToMetadata,
} from '@/lib/seo/seo-to-metadata';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  'http://localhost:3000';

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

/*
 * Product pages are cached for 1 hour.
 *
 * بعداً می‌توانیم این را با on-demand
 * revalidation از WooCommerce جایگزین کنیم.
 */
export const revalidate = 3600;

/* =========================================================
   Helpers
   ========================================================= */

function stripHtml(
  value?: string | null,
): string {
  if (!value) {
    return '';
  }

  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function truncate(
  value: string,
  maxLength = 160,
): string {
  if (!value) {
    return '';
  }

  if (value.length <= maxLength) {
    return value;
  }

  return `${value
    .slice(0, maxLength)
    .trim()}...`;
}

function getProductDescription(
  product: Awaited<
    ReturnType<typeof getProductBySlug>
  >,
) {
  if (!product) {
    return '';
  }

  const shortDescription =
    stripHtml(
      product.shortDescription,
    );

  if (shortDescription) {
    return truncate(
      shortDescription,
    );
  }

  const description =
    stripHtml(
      product.description,
    );

  if (description) {
    return truncate(
      description,
    );
  }

  return truncate(
    `${product.name} - اطلاعات، قیمت و جزئیات محصول در رژیتامین.`,
  );
}

/* =========================================================
   Metadata
   ========================================================= */

export async function generateMetadata(
  { params }: PageProps,
): Promise<Metadata> {
  const { slug } = await params;

  const product =
    await getProductBySlug(slug);

  if (!product) {
    return {
      title: 'محصول پیدا نشد | رژیتامین',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const productUrl =
    `${SITE_URL}/product/${product.slug}`;

  const description =
    getProductDescription(
      product,
    );

  /*
   * فعلاً SEO محصول از داده WooCommerce
   * تولید می‌شود.
   *
   * اگر بعداً SEO repository محصول را به
   * RankMath وصل کنیم، می‌توانیم آن را
   * به عنوان source of truth استفاده کنیم.
   */

  const primaryImage =
    product.images?.[0];

  return {
    title: {
      absolute: `${product.name} | رژیتامین`,
    },

    description,

    alternates: {
      canonical: productUrl,
    },

    robots: {
      index: true,
      follow: true,
    },

    openGraph: {
      type: 'website',
      locale: 'fa_IR',
      siteName: 'رژیتامین',

      title:
        `${product.name} | رژیتامین`,

      description,

      url: productUrl,

      images: primaryImage
        ? [
            {
              url: primaryImage.src,
              alt:
                primaryImage.alt ||
                product.name,
            },
          ]
        : [],
    },

    twitter: {
      card: 'summary_large_image',

      title:
        `${product.name} | رژیتامین`,

      description,

      images: primaryImage
        ? [primaryImage.src]
        : [],
    },
  };
}

/* =========================================================
   Page
   ========================================================= */

export default async function ProductPage({
  params,
}: PageProps) {
  const { slug } = await params;

  /*
   * Product request
   */
  const product =
    await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  /*
   * Related products
   *
   * اگر relatedIds خالی باشد،
   * درخواست اضافی نمی‌زنیم.
   */
  const relatedProducts =
    product.relatedIds?.length
      ? await getRelatedProducts(
          product.relatedIds,
        )
      : [];

  const productUrl =
    `${SITE_URL}/product/${product.slug}`;

  /* =======================================================
     Breadcrumb
     ======================================================= */

  const breadcrumbItems = [
    {
      name: 'خانه',
      item: SITE_URL,
    },
    {
      name: 'رژیم‌ها',
      item: `${SITE_URL}/shop`,
    },
    {
      name: product.name,
      item: productUrl,
    },
  ];

  return (
    <>
      {/* ===================================================
          Breadcrumb Schema
          =================================================== */}

      <BreadcrumbSchema
        items={breadcrumbItems}
      />

      {/* ===================================================
          Product Schema
          =================================================== */}

<ProductSchema product={product} />
      {/* ===================================================
          Product UI
          =================================================== */}

      <ProductPageContent
        product={product}
        relatedProducts={
          relatedProducts
        }
      />
    </>
  );
}