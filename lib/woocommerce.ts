// lib/woocommerce.ts

const API_URL =
  process.env.WOOCOMMERCE_API_URL ||
  'http://localhost:8080/wp-json/wc/v3';

const CONSUMER_KEY = process.env.WOOCOMMERCE_CONSUMER_KEY || '';
const CONSUMER_SECRET =
  process.env.WOOCOMMERCE_CONSUMER_SECRET || '';

/**
 * =========================================================
 * WooCommerce API Configuration
 * =========================================================
 */

function getAuthHeader(): string {
  if (!CONSUMER_KEY || !CONSUMER_SECRET) {
    throw new Error(
      'WooCommerce credentials are missing. Please check WOOCOMMERCE_CONSUMER_KEY and WOOCOMMERCE_CONSUMER_SECRET.'
    );
  }

  return `Basic ${Buffer.from(
    `${CONSUMER_KEY}:${CONSUMER_SECRET}`
  ).toString('base64')}`;
}

/**
 * =========================================================
 * Generic WooCommerce Fetcher
 * =========================================================
 *
 * تمام درخواست‌های WooCommerce از این تابع عبور می‌کنند.
 *
 * نکته امنیتی:
 * Consumer Key و Consumer Secret فقط در Server-side استفاده
 * می‌شوند و نباید با NEXT_PUBLIC_ تعریف شوند.
 */
async function wooFetch<T = unknown>(
  endpoint: string,
  options?: {
    revalidate?: number;
    tags?: string[];
  }
): Promise<{
  data: T;
  response: Response;
}> {
  const url = `${API_URL}${endpoint}`;

  const res = await fetch(url, {
    headers: {
      Authorization: getAuthHeader(),
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },

    next: {
      revalidate: options?.revalidate ?? 3600,
      tags: options?.tags ?? ['woocommerce'],
    },
  });

  if (!res.ok) {
    const errorBody = await res.text();

    console.error('WooCommerce API Error:', {
      status: res.status,
      statusText: res.statusText,
      url,
      body: errorBody,
    });

    throw new Error(
      `WooCommerce API error: ${res.status} ${res.statusText}`
    );
  }

  const data = (await res.json()) as T;

  return {
    data,
    response: res,
  };
}

/**
 * =========================================================
 * Public WooCommerce Data
 * =========================================================
 *
 * این توابع از نظر کاربرد "Public Data" هستند،
 * اما درخواست از Server به WooCommerce با Credential
 * احراز هویت می‌شود.
 *
 * Credential هرگز به Browser ارسال نمی‌شود.
 */

/**
 * دریافت اطلاعات عمومی WooCommerce
 */
export async function wooFetchPublic<T = unknown>(
  endpoint: string
): Promise<T> {
  const { data } = await wooFetch<T>(endpoint, {
    revalidate: 3600,
    tags: ['products'],
  });

  return data;
}

/**
 * دریافت اطلاعات عمومی WooCommerce
 * به همراه اطلاعات Pagination
 */
export async function wooFetchPublicWithMeta<T = unknown>(
  endpoint: string
): Promise<{
  data: T;
  total: number;
  totalPages: number;
}> {
  const { data, response } = await wooFetch<T>(endpoint, {
    revalidate: 3600,
    tags: ['products'],
  });

  const total = parseInt(
    response.headers.get('X-WP-Total') || '0',
    10
  );

  const totalPages = parseInt(
    response.headers.get('X-WP-TotalPages') || '1',
    10
  );

  return {
    data,
    total,
    totalPages,
  };
}

/**
 * =========================================================
 * Private WooCommerce Data
 * =========================================================
 *
 * برای endpointهایی که به صورت منطقی خصوصی هستند.
 *
 * فعلاً همان رفتار Server-side قبلی حفظ شده است.
 */
export async function wooFetchPrivate<T = unknown>(
  endpoint: string
): Promise<T> {
  const { data } = await wooFetch<T>(endpoint, {
    revalidate: 3600,
    tags: ['woocommerce-private'],
  });

  return data;
}

/**
 * =========================================================
 * Cache Revalidation Helpers
 * =========================================================
 *
 * این tagها را بعداً می‌توانیم از Webhook وردپرس
 * برای Revalidate کردن محصولات استفاده کنیم.
 */

export const WOOCOMMERCE_CACHE_TAGS = {
  products: 'products',
  private: 'woocommerce-private',
  all: 'woocommerce',
} as const;