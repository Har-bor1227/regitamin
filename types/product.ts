export interface ProductCategory {
  id: number;
  name: string;
  slug: string;
}

export interface ProductImage {
  id: number;
  src: string;
  alt: string;
}

export interface ProductAttribute {
  id: number;
  name: string;
  options: string[];
  variation: boolean;
}

export interface ProductVariation {
  id: number;
  attributes: { name: string; option: string }[];
  price: string;
  regularPrice: string;
  salePrice: string;
  onSale: boolean;
  inStock: boolean;
  stockQuantity: number | null;
  sku: string;
  image?: ProductImage;
}

export interface ProductSummary {
  id: number;
  name: string;
  slug: string;
  price: string;
  regularPrice: string;
  salePrice: string;
  onSale: boolean;
  images: ProductImage[];
  categories: ProductCategory[];
  shortDescription: string;
  averageRating: string;
  ratingCount: number;
  type: 'simple' | 'variable';
}

export interface Product extends ProductSummary {
  sku: string;
  stockQuantity: number | null;
  description: string;
  attributes: ProductAttribute[];
  variations?: ProductVariation[];
  relatedIds: number[];
  permalink?: string;   // ← اضافه شد
}