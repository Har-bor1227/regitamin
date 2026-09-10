import { wpFetch } from '@/lib/wordpress-api';
import type { Category } from '@/types/category';

export async function getCategories(): Promise<Category[]> {
  const data = await wpFetch<any>('/wp/v2/product_cat?per_page=50');
  return data.map((item: any) => ({
    id: item.id,
    name: item.name,
    slug: item.slug,
    description: item.description || '',
    image: item.yoast_head_json?.og_image?.[0]?.url || undefined,
    count: item.count,
  }));
}