import type { SeoData } from '@/types/seo';
import { extractJsonLdFromUrl } from '@/lib/extract-jsonld';

const WP_API_BASE = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'http://localhost:8080/wp-json';

/**
 * دریافت SEO کامل (متادیتا + JSON‑LD) برای یک محصول/پست
 * @param postId - ID عددی پست در وردپرس
 * @param wpUrl  - URL کامل صفحه در وردپرس (برای استخراج JSON‑LD)
 */
export async function getSeoData(postId: number, wpUrl: string): Promise<SeoData | null> {
  try {
    // ۱. دریافت متادیتا از endpoint سفارشی
    const res = await fetch(`${WP_API_BASE}/dot/v1/seo/${postId}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const seo: SeoData = await res.json();

    // ۲. دریافت JSON‑LD از HTML وردپرس
    const extracted = await extractJsonLdFromUrl(wpUrl);
seo.jsonLd = extracted.map((item) => (typeof item === 'string' ? JSON.parse(item) : item)); 
    return seo;
  } catch {
    return null;
  }
}