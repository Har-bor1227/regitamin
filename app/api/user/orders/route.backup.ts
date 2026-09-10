import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { verifyToken } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface WooOrderLineItem {
  name?: unknown;
  quantity?: unknown;
  total?: unknown;
}

interface WooOrderBilling {
  phone?: unknown;
}

interface WooOrder {
  id: number;
  customer_id?: number;
  status?: string;
  total?: string;
  currency?: string;
  date_created?: string;
  billing?: WooOrderBilling;
  line_items?: WooOrderLineItem[];
}

const WOO_API =
  process.env.WOOCOMMERCE_API_URL?.trim() || '';

const WOO_KEY =
  process.env.WOOCOMMERCE_CONSUMER_KEY?.trim() || '';

const WOO_SECRET =
  process.env.WOOCOMMERCE_CONSUMER_SECRET?.trim() || '';

function normalizeIranPhone(value: unknown): string {
  if (typeof value !== 'string') {
    return '';
  }

  return value
    .replace(/[۰-۹]/g, (digit) =>
      String(
        '۰۱۲۳۴۵۶۷۸۹'.indexOf(digit),
      ),
    )
    .replace(/[٠-٩]/g, (digit) =>
      String(
        '٠١٢٣٤٥٦٧٨٩'.indexOf(digit),
      ),
    )
    .replace(/\s+/g, '')
    .trim();
}

function getWooAuthHeader(): string {
  return `Basic ${Buffer.from(
    `${WOO_KEY}:${WOO_SECRET}`,
  ).toString('base64')}`;
}

export async function GET() {
  try {
    /*
     * =========================================================
     * 1. Validate WooCommerce configuration
     * =========================================================
     */

    if (!WOO_API || !WOO_KEY || !WOO_SECRET) {
      console.error(
        'User orders API: WooCommerce configuration is missing.',
      );

      return NextResponse.json(
        {
          error: 'Server configuration error',
        },
        { status: 500 },
      );
    }

    /*
     * =========================================================
     * 2. Read authenticated session
     * =========================================================
     */

    const cookieStore = await cookies();

    const token =
      cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
        },
        { status: 401 },
      );
    }

    /*
     * =========================================================
     * 3. Verify JWT
     * =========================================================
     */

    const payload =
      await verifyToken(token);

    if (!payload?.phone) {
      return NextResponse.json(
        {
          error: 'Invalid token',
        },
        { status: 401 },
      );
    }

    const phone =
      normalizeIranPhone(
        payload.phone,
      );

    const customerId =
      typeof payload.customerId === 'number' &&
      Number.isInteger(payload.customerId) &&
      payload.customerId > 0
        ? payload.customerId
        : null;

    /*
     * =========================================================
     * 4. Customer ID is the primary ownership source
     * =========================================================
     *
     * WooCommerce officially supports:
     *
     * /orders?customer=<CUSTOMER_ID>
     *
     * This is much safer and more reliable than trying to use
     * billing_phone as a REST collection filter.
     */

    if (!customerId) {
      /*
       * حساب‌هایی که Customer ID ندارند باید از این endpoint
       * هیچ سفارشی دریافت نکنند.
       *
       * این رفتار عمداً fail-closed است:
       * بهتر است سفارش کاربر نمایش داده نشود تا اینکه
       * سفارش‌های سایر کاربران نشت کند.
       */

      return NextResponse.json({
        orders: [],
      });
    }

    /*
     * =========================================================
     * 5. Fetch only this customer's orders from WooCommerce
     * =========================================================
     */

    const query = new URLSearchParams({
      customer: String(customerId),
      per_page: '100',
      page: '1',
      orderby: 'date',
      order: 'desc',
    });

    const response = await fetch(
      `${WOO_API}/orders?${query.toString()}`,
      {
        method: 'GET',
        headers: {
          Authorization:
            getWooAuthHeader(),
          Accept: 'application/json',
        },
        cache: 'no-store',
      },
    );

    if (!response.ok) {
      const errorText =
        await response.text();

      console.error(
        'User orders API: WooCommerce request failed.',
        {
          status: response.status,
          body: errorText,
          customerId,
        },
      );

      return NextResponse.json(
        {
          error:
            'دریافت سفارش‌ها انجام نشد.',
        },
        { status: 502 },
      );
    }

    const rawOrders =
      await response.json();

    if (!Array.isArray(rawOrders)) {
      console.error(
        'User orders API: WooCommerce returned invalid data.',
      );

      return NextResponse.json(
        {
          error:
            'پاسخ نامعتبر از WooCommerce دریافت شد.',
        },
        { status: 502 },
      );
    }

    /*
     * =========================================================
     * 6. Defensive ownership check
     * =========================================================
     *
     * حتی با وجود customer query، دوباره نتیجه را سمت سرور
     * بررسی می‌کنیم تا هیچ Order اشتباهی هرگز به client نرسد.
     *
     * شرط اصلی:
     *
     * order.customer_id === authenticated customerId
     *
     * و در صورت موجود بودن شماره:
     *
     * billing.phone === authenticated phone
     *
     * برای سازگاری با بعضی سفارش‌های قدیمی، نبودن billing phone
     * به‌تنهایی باعث حذف سفارش نمی‌شود؛ customer_id معیار اصلی
     * مالکیت است.
     */

    const ownedOrders =
      (rawOrders as WooOrder[]).filter(
        (order) => {
          const orderCustomerId =
            Number(
              order?.customer_id || 0,
            );

          if (
            orderCustomerId !==
            customerId
          ) {
            return false;
          }

          const orderPhone =
            normalizeIranPhone(
              order?.billing?.phone,
            );

          /*
           * اگر billing phone وجود دارد،
           * باید با شماره احراز هویت‌شده یکی باشد.
           */
          if (
            orderPhone &&
            phone &&
            orderPhone !== phone
          ) {
            return false;
          }

          return true;
        },
      );

    /*
     * =========================================================
     * 7. Sanitize response
     * =========================================================
     *
     * هیچ داده حساس اضافی از WooCommerce به Browser ارسال
     * نمی‌شود.
     */

    const formattedOrders =
      ownedOrders.map(
        (order) => ({
          id: Number(order.id),
          status:
            typeof order.status === 'string'
              ? order.status
              : 'pending',

          total:
            typeof order.total === 'string'
              ? order.total
              : '0',

          currency:
            typeof order.currency === 'string'
              ? order.currency
              : '',

          date:
            typeof order.date_created ===
            'string'
              ? order.date_created
              : '',

          items: Array.isArray(
            order.line_items,
          )
            ? order.line_items.map(
                (item) => ({
                  name:
                    typeof item.name ===
                    'string'
                      ? item.name
                      : '',

                  quantity:
                    Number.isFinite(
                      Number(
                        item.quantity,
                      ),
                    )
                      ? Number(
                          item.quantity,
                        )
                      : 0,

                  total:
                    typeof item.total ===
                    'string'
                      ? item.total
                      : '0',
                }),
              )
            : [],
        }),
      );

    /*
     * =========================================================
     * 8. Final response
     * =========================================================
     */

    return NextResponse.json(
      {
        orders:
          formattedOrders,
      },
      {
        status: 200,
        headers: {
          'Cache-Control':
            'private, no-store, max-age=0',
        },
      },
    );
  } catch (error) {
    console.error(
      'User orders API error:',
      error,
    );

    return NextResponse.json(
      {
        error:
          'خطایی هنگام دریافت سفارش‌ها رخ داد.',
      },
      { status: 500 },
    );
  }
}