import { wooFetchPublic, wooFetchPublicWithMeta } from '@/lib/woocommerce';
import type { ProductSummary, Product, ProductVariation } from '@/types/product';

export async function getProducts(params?: {
  page?: number;
  perPage?: number;
  category?: string;
  search?: string;
  orderby?: string;
  minPrice?: number;
  maxPrice?: number;
}): Promise<{ products: ProductSummary[]; total: number; totalPages: number }> {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.perPage) query.set('per_page', String(params.perPage));
  if (params?.category) query.set('category', params.category);
  if (params?.search) query.set('search', params.search);
  if (params?.minPrice !== undefined) query.set('min_price', String(params.minPrice));
  if (params?.maxPrice !== undefined) query.set('max_price', String(params.maxPrice));

  if (params?.orderby) {
    const allowedOrderby = [
      'date', 'id', 'include', 'title', 'slug', 'modified',
      'popularity', 'rating', 'price', 'menu_order', 'random'
    ];
    if (params.orderby === 'price-asc') {
      query.set('orderby', 'price');
      query.set('order', 'asc');
    } else if (params.orderby === 'price-desc') {
      query.set('orderby', 'price');
      query.set('order', 'desc');
    } else if (allowedOrderby.includes(params.orderby)) {
      query.set('orderby', params.orderby);
    }
  }

  const endpoint = `/products?${query.toString()}`;
  const { data, total, totalPages } = await wooFetchPublicWithMeta<any>(endpoint);

  const products: ProductSummary[] = data.map(mapProductSummary);
  return { products, total, totalPages };
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const endpoint = `/products?slug=${encodeURIComponent(slug)}`;
  const data = await wooFetchPublic<any>(endpoint);
  if (!data || data.length === 0) return null;

  const product = mapProduct(data[0]);

  if (product.type === 'variable') {
    const variationsEndpoint = `/products/${product.id}/variations?per_page=100`;
    const variationsData = await wooFetchPublic<any>(variationsEndpoint);
    product.variations = variationsData.map(mapVariation);
  }

  return product;
}

export async function getFeaturedProducts(): Promise<ProductSummary[]> {
  const data = await wooFetchPublic<any>('/products?on_sale=true&per_page=8');
  return data.map(mapProductSummary);
}

export async function getRelatedProducts(ids: number[]): Promise<ProductSummary[]> {
  if (!ids || ids.length === 0) return [];
  const include = ids.join(',');
  const data = await wooFetchPublic<any>(`/products?include=${include}&per_page=4`);
  return data.map(mapProductSummary);
}

// ─── توابع نگاشت ──────────────────────────────────

function mapProductSummary(item: any): ProductSummary {
  return {
    id: item.id,
    name: item.name,
    slug: item.slug,
    price: item.price,
    regularPrice: item.regular_price,
    salePrice: item.sale_price,
    onSale: item.on_sale,
    images: item.images.map((img: any) => ({
      id: img.id,
      src: img.src,
      alt: img.alt || item.name,
    })),
    categories: item.categories.map((cat: any) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
    })),
    shortDescription: item.short_description?.replace(/<[^>]+>/g, '') || '',
    averageRating: item.average_rating,
    ratingCount: item.rating_count,
    type: item.type || 'simple',
  };
}

function mapProduct(item: any): Product {
  return {
    ...mapProductSummary(item),
    sku: item.sku || '',
    stockQuantity: item.stock_quantity ?? null,
    description: item.description,
    relatedIds: item.related_ids || [],
    permalink: item.permalink || '',   // ← اضافه شد
    attributes: item.attributes.map((attr: any) => ({
      id: attr.id,
      name: attr.name,
      options: attr.options,
      variation: attr.variation || false,
    })),
  };
}

function mapVariation(variation: any): ProductVariation {
  return {
    id: variation.id,
    attributes: variation.attributes.map((attr: any) => ({
      name: attr.name,
      option: attr.option,
    })),
    price: variation.price,
    regularPrice: variation.regular_price,
    salePrice: variation.sale_price,
    onSale: variation.on_sale,
    inStock: variation.stock_status === 'instock',
    stockQuantity: variation.stock_quantity ?? null,
    sku: variation.sku || '',
    image: variation.image
      ? {
          id: variation.image.id,
          src: variation.image.src,
          alt: variation.image.alt || '',
        }
      : undefined,
  };
}
export async function getLatestProducts(count: number = 8): Promise<ProductSummary[]> {
  const data = await wooFetchPublic<any>(`/products?per_page=${count}&orderby=date&order=desc&status=publish`);
  return data.map(mapProductSummary);
}
export async function getOnSaleProducts(count: number = 8): Promise<ProductSummary[]> {
  const data = await wooFetchPublic<any>(`/products?on_sale=true&per_page=${count}&status=publish`);
  return data.map(mapProductSummary);
}