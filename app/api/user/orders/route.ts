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

interface WooOrderMeta {
  key?: unknown;
  value?: unknown;
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
  meta_data?: WooOrderMeta[];
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
      String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)),
    )
    .replace(/[٠-٩]/g, (digit) =>
      String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)),
    )
    .replace(/[^\d+]/g, '')
    .replace(/^(\+98|0098)/, '0')
    .replace(/^98/, '0')
    .trim();
}

function getWooAuthHeader(): string {
  return `Basic ${Buffer.from(
    `${WOO_KEY}:${WOO_SECRET}`,
  ).toString('base64')}`;
}

function getOrderMeta(
  metaData: WooOrderMeta[] | undefined,
  key: string,
): string {
  if (!Array.isArray(metaData)) {
    return '';
  }

  const item = metaData.find(
    (entry) =>
      String(entry?.key || '') === key,
  );

  return String(item?.value ?? '');
}

async function fetchWooOrders(
  params: URLSearchParams,
): Promise<WooOrder[]> {
  const response = await fetch(
    `${WOO_API}/orders?${params.toString()}`,
    {
      method: 'GET',
      headers: {
        Authorization: getWooAuthHeader(),
        Accept: 'application/json',
      },
      cache: 'no-store',
    },
  );

  if (!response.ok) {
    const errorText = await response.text();

    console.error(
      'User orders API: WooCommerce request failed.',
      {
        status: response.status,
        body: errorText,
      },
    );

    throw new Error(
      'WooCommerce orders request failed',
    );
  }

  const data = await response.json();

  return Array.isArray(data)
    ? (data as WooOrder[])
    : [];
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
     * 2. Authentication
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
      normalizeIranPhone(payload.phone);

    const customerId =
      typeof payload.customerId === 'number' &&
      Number.isInteger(payload.customerId) &&
      payload.customerId > 0
        ? payload.customerId
        : null;

    /*
     * =========================================================
     * 3. Resolve customer ID
     * =========================================================
     */

    let resolvedCustomerId =
      customerId;

    if (!resolvedCustomerId) {
      const customersResponse =
        await fetch(
          `${WOO_API}/customers?search=${encodeURIComponent(
            phone,
          )}&per_page=100`,
          {
            method: 'GET',
            headers: {
              Authorization:
                getWooAuthHeader(),
              Accept:
                'application/json',
            },
            cache: 'no-store',
          },
        );

      if (customersResponse.ok) {
        const customers =
          await customersResponse.json();

        if (Array.isArray(customers)) {
          const matchingCustomer =
            customers.find(
              (customer: any) =>
                normalizeIranPhone(
                  customer?.phone,
                ) === phone,
            );

          if (
            matchingCustomer &&
            Number.isInteger(
              Number(
                matchingCustomer.id,
              ),
            ) &&
            Number(
              matchingCustomer.id,
            ) > 0
          ) {
            resolvedCustomerId =
              Number(
                matchingCustomer.id,
              );
          }
        }
      }
    }

    /*
     * =========================================================
     * 4. Fetch orders
     * =========================================================
     */

    const ordersMap =
      new Map<number, WooOrder>();

    if (resolvedCustomerId) {
      const customerOrders =
        await fetchWooOrders(
          new URLSearchParams({
            customer:
              String(
                resolvedCustomerId,
              ),
            per_page: '100',
            page: '1',
            orderby: 'date',
            order: 'desc',
          }),
        );

      for (
        const order of customerOrders
      ) {
        const orderId =
          Number(order?.id);

        if (
          Number.isInteger(orderId) &&
          orderId > 0
        ) {
          ordersMap.set(
            orderId,
            order,
          );
        }
      }
    }

    /*
     * =========================================================
     * 5. Legacy orders by phone
     * =========================================================
     */

    let page = 1;
    const maxPages = 10;

    while (page <= maxPages) {
      const legacyOrders =
        await fetchWooOrders(
          new URLSearchParams({
            per_page: '100',
            page: String(page),
            orderby: 'date',
            order: 'desc',
          }),
        );

      if (
        legacyOrders.length === 0
      ) {
        break;
      }

      for (
        const order of legacyOrders
      ) {
        const orderId =
          Number(order?.id);

        if (
          !Number.isInteger(orderId) ||
          orderId <= 0
        ) {
          continue;
        }

        const orderCustomerId =
          Number(
            order?.customer_id || 0,
          );

        const orderPhone =
          normalizeIranPhone(
            order?.billing?.phone,
          );

        const belongsToCustomer =
          Boolean(
            resolvedCustomerId &&
              orderCustomerId ===
                resolvedCustomerId,
          );

        const belongsToPhone =
          Boolean(
            orderCustomerId === 0 &&
              phone &&
              orderPhone &&
              orderPhone === phone,
          );

        if (
          belongsToCustomer ||
          belongsToPhone
        ) {
          ordersMap.set(
            orderId,
            order,
          );
        }
      }

      if (
        legacyOrders.length < 100
      ) {
        break;
      }

      page += 1;
    }

    /*
     * =========================================================
     * 6. Final ownership check
     * =========================================================
     */

    const ownedOrders =
      Array.from(
        ordersMap.values(),
      ).filter(
        (order) => {
          const orderCustomerId =
            Number(
              order?.customer_id || 0,
            );

          const orderPhone =
            normalizeIranPhone(
              order?.billing?.phone,
            );

          if (
            resolvedCustomerId &&
            orderCustomerId ===
              resolvedCustomerId
          ) {
            if (
              orderPhone &&
              phone &&
              orderPhone !== phone
            ) {
              return false;
            }

            return true;
          }

          if (
            orderCustomerId === 0 &&
            phone &&
            orderPhone === phone
          ) {
            return true;
          }

          return false;
        },
      );

    /*
     * =========================================================
     * 7. Sort newest first
     * =========================================================
     */

    ownedOrders.sort(
      (a, b) => {
        const dateA =
          new Date(
            a.date_created || 0,
          ).getTime();

        const dateB =
          new Date(
            b.date_created || 0,
          ).getTime();

        return dateB - dateA;
      },
    );

    /*
     * =========================================================
     * 8. Sanitize response
     * =========================================================
     */

    const formattedOrders =
      ownedOrders.map(
        (order) => {
          const pdfUrl =
            getOrderMeta(
              order.meta_data,
              '_regitamin_diet_pdf_url',
            );

          const pdfName =
            getOrderMeta(
              order.meta_data,
              '_regitamin_diet_pdf_name',
            ) ||
            'فایل رژیم.pdf';

          return {
            id: Number(order.id),

            status:
              typeof order.status ===
              'string'
                ? order.status
                : 'pending',

            total:
              typeof order.total ===
              'string'
                ? order.total
                : '0',

            currency:
              typeof order.currency ===
              'string'
                ? order.currency
                : '',

            date:
              typeof order.date_created ===
              'string'
                ? order.date_created
                : '',

            pdf: pdfUrl
              ? {
                  available: true,
                  name: pdfName,
                }
              : null,

            items:
              Array.isArray(
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
          };
        },
      );

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