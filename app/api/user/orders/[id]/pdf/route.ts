import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { verifyToken } from '@/lib/auth-utils';

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

function getMeta(
  metaData: any[],
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

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  try {
    if (
      !WOO_API ||
      !WOO_KEY ||
      !WOO_SECRET
    ) {
      return NextResponse.json(
        {
          error:
            'Server configuration error',
        },
        { status: 500 },
      );
    }

    /*
     * =========================================================
     * 1. Authenticate user
     * =========================================================
     */

    const cookieStore =
      await cookies();

    const token =
      cookieStore.get(
        'auth_token',
      )?.value;

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
      normalizeIranPhone(
        payload.phone,
      );

    const customerId =
      typeof payload.customerId ===
        'number' &&
      Number.isInteger(
        payload.customerId,
      ) &&
      payload.customerId > 0
        ? payload.customerId
        : null;

    /*
     * =========================================================
     * 2. Validate order ID
     * =========================================================
     */

    const { id } =
      await params;

    const orderId =
      Number(id);

    if (
      !Number.isInteger(orderId) ||
      orderId <= 0
    ) {
      return NextResponse.json(
        {
          error:
            'Invalid order ID',
        },
        { status: 400 },
      );
    }

    /*
     * =========================================================
     * 3. Fetch order
     * =========================================================
     */

    const orderResponse =
      await fetch(
        `${WOO_API}/orders/${orderId}`,
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

    if (
      !orderResponse.ok
    ) {
      if (
        orderResponse.status ===
        404
      ) {
        return NextResponse.json(
          {
            error:
              'Order not found',
          },
          { status: 404 },
        );
      }

      const errorText =
        await orderResponse.text();

      console.error(
        'User PDF: WooCommerce request failed.',
        {
          status:
            orderResponse.status,
          body: errorText,
        },
      );

      return NextResponse.json(
        {
          error:
            'Failed to fetch order',
        },
        { status: 500 },
      );
    }

    const order =
      await orderResponse.json();

    /*
     * =========================================================
     * 4. Verify ownership
     * =========================================================
     */

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
        customerId &&
          orderCustomerId ===
            customerId,
      );

    const belongsToPhone =
      Boolean(
        phone &&
          orderPhone &&
          orderPhone === phone,
      );

    if (
      !belongsToCustomer &&
      !belongsToPhone
    ) {
      return NextResponse.json(
        {
          error:
            'Forbidden',
        },
        { status: 403 },
      );
    }

    /*
     * =========================================================
     * 5. Get PDF URL from order meta
     * =========================================================
     */

    const metaData =
      Array.isArray(
        order?.meta_data,
      )
        ? order.meta_data
        : [];

    const pdfUrl =
      getMeta(
        metaData,
        '_regitamin_diet_pdf_url',
      );

    const pdfName =
      getMeta(
        metaData,
        '_regitamin_diet_pdf_name',
      ) ||
      'فایل رژیم.pdf';

    if (!pdfUrl) {
      return NextResponse.json(
        {
          error:
            'PDF not available',
        },
        { status: 404 },
      );
    }

    /*
     * =========================================================
     * 6. Fetch PDF from WordPress
     * =========================================================
     */

    const pdfResponse =
      await fetch(
        pdfUrl,
        {
          method: 'GET',
          cache: 'no-store',
        },
      );

    if (
      !pdfResponse.ok
    ) {
      console.error(
        'User PDF: WordPress PDF fetch failed.',
        {
          status:
            pdfResponse.status,
          url: pdfUrl,
        },
      );

      return NextResponse.json(
        {
          error:
            'Failed to fetch PDF',
        },
        { status: 502 },
      );
    }

    const pdfBuffer =
      await pdfResponse.arrayBuffer();

    /*
     * =========================================================
     * 7. Determine inline/download mode
     * =========================================================
     */

    const url =
      new URL(request.url);

    const download =
      url.searchParams.get(
        'download',
      ) === '1';

    const disposition =
      download
        ? 'attachment'
        : 'inline';

    /*
     * =========================================================
     * 8. Return PDF
     * =========================================================
     */

    return new Response(
      pdfBuffer,
      {
        status: 200,

        headers: {
          'Content-Type':
            'application/pdf',

          'Content-Disposition':
            `${disposition}; filename="${encodeURIComponent(
              pdfName,
            )}"`,

          'Cache-Control':
            'private, no-store, max-age=0',

          'X-Content-Type-Options':
            'nosniff',
        },
      },
    );
  } catch (error) {
    console.error(
      'User PDF API error:',
      error,
    );

    return NextResponse.json(
      {
        error:
          'خطایی هنگام دریافت فایل رژیم رخ داد.',
      },
      { status: 500 },
    );
  }
}