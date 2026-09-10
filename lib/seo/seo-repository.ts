import { cache } from 'react';
import { graphqlClient } from '@/lib/graphql-client';
import { extractJsonLdFromUrl } from '@/lib/extract-jsonld';
import type { SeoData } from '@/types/seo';

const WP_API_BASE = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'http://localhost:8080/wp-json';
const FETCH_TIMEOUT = 8000; // 8 ثانیه

/**
 * fetch با timeout خودکار – اگر پاسخ نیاید، null برمی‌گرداند
 */
async function fetchWithTimeout(url: string, options?: RequestInit, timeout = FETCH_TIMEOUT): Promise<Response | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      return null;
    }
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * دریافت SEO از WPGraphQL (برای پست‌ها، برگه‌ها و هر نوع دیگری که در GraphQL موجود است)
 * با cache جلوگیری از fetch تکراری در یک رندر
 * @param postId - شناسه عددی پست
 * @param postType - نوع پست (پیش‌فرض 'post')
 * @param wpUrl - آدرس کامل صفحه در وردپرس (اختیاری، برای استخراج JSON‑LD در صورت نیاز)
 */
export const fetchSeoFromGraphQL = cache(
  async (postId: string, postType: string = 'post', wpUrl?: string): Promise<SeoData | null> => {
    const query = `
      query GetSeo($id: ID!) {
        ${postType}(id: $id, idType: DATABASE_ID) {
          seo {
            title
            description
            canonical
            focusKeyword
            robots {
              index
              follow
              noarchive
              nosnippet
              maxSnippet
              maxImagePreview
              maxVideoPreview
            }
            openGraph {
              title
              description
              image { url width height alt }
              type
              url
              siteName
              locale
              articleAuthor
              articlePublishedTime
              articleModifiedTime
            }
            twitter {
              title
              description
              image
              cardType
              site
              creator
            }
            jsonLd
          }
        }
      }
    `;

    try {
      const data = await graphqlClient.request<any>(query, { id: postId });
      const seoNode = data?.[postType]?.seo;
      if (!seoNode) return null;

      const seo = seoNode as SeoData;

      // اگر JSON‑LD وجود نداشت و URL وردپرس داریم، مستقیماً از HTML استخراج کن
      if ((!seo.jsonLd || seo.jsonLd.length === 0) && wpUrl) {
        seo.jsonLd = await extractJsonLdFromUrl(wpUrl);
      }

      return seo;
    } catch {
      return null;
    }
  }
);

/**
 * دریافت SEO برای محصول (از REST API اختصاصی) با timeout
 * با cache جلوگیری از fetch تکراری
 * @param productId - شناسه محصول
 * @param wpUrl - آدرس کامل محصول در وردپرس (اختیاری، برای استخراج JSON‑LD)
 */
export const fetchSeoForProduct = cache(
  async (productId: number, wpUrl?: string): Promise<SeoData | null> => {
    try {
      const res = await fetchWithTimeout(`${WP_API_BASE}/dot/v1/seo/${productId}`, {
        next: { revalidate: 3600 },
      });
      if (!res || !res.ok) return null;
      const seo: SeoData = await res.json();

      // اگر JSON‑LD وجود نداشت و URL وردپرس داریم، از HTML استخراج کن
      if ((!seo.jsonLd || seo.jsonLd.length === 0) && wpUrl) {
        seo.jsonLd = await extractJsonLdFromUrl(wpUrl);
      }

      return seo;
    } catch {
      return null;
    }
  }
);