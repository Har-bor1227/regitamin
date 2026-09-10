import type { Product } from '@/types/product';

interface ProductSchemaProps {
  product: Product;
  baseUrl?: string;
}

export function ProductSchema({
  product,
  baseUrl,
}: ProductSchemaProps) {
  const siteUrl =
    baseUrl ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    'http://localhost:3000';

  const productUrl =
    `${siteUrl}/product/${product.slug}`;

  const images = (product.images || [])
    .map((image) => image.src)
    .filter(Boolean);

  const price =
    product.salePrice ||
    product.price ||
    product.regularPrice ||
    '';

  const availability =
    product.stockQuantity !== null &&
    product.stockQuantity !== undefined &&
    product.stockQuantity <= 0
      ? 'https://schema.org/OutOfStock'
      : 'https://schema.org/InStock';

  const categories =
    product.categories?.map(
      (category) => category.name,
    ) || [];

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',

    name: product.name,

    url: productUrl,

    description:
      product.shortDescription ||
      product.description ||
      '',

    image: images,

    sku:
      product.sku ||
      undefined,

    category:
      categories.length > 0
        ? categories.join(', ')
        : undefined,

    brand: {
      '@type': 'Brand',
      name: 'رژیتامین',
    },

    offers: {
      '@type': 'Offer',

      url: productUrl,

      priceCurrency: 'IRR',

      price:
        Number(price || 0) * 10,

      availability,

      itemCondition:
        'https://schema.org/NewCondition',

      seller: {
        '@type': 'Organization',
        name: 'رژیتامین',
        url: siteUrl,
      },
    },

    ...(Number(product.averageRating) > 0 &&
    product.ratingCount > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue:
              Number(
                product.averageRating,
              ),
            reviewCount:
              Number(
                product.ratingCount,
              ),
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(
          schema,
        ),
      }}
    />
  );
}