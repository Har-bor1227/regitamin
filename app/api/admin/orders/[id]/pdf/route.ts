import { NextResponse } from 'next/server';

import { requireAdmin } from '@/lib/admin-auth';

import { getAdminOrder } from '@/lib/admin-orders';

const WOO_API =
  process.env.WOOCOMMERCE_API_URL?.trim() || '';

const WOO_KEY =
  process.env.WOOCOMMERCE_CONSUMER_KEY?.trim() || '';

const WOO_SECRET =
  process.env.WOOCOMMERCE_CONSUMER_SECRET?.trim() || '';

const WP_USERNAME =
  process.env.WP_USERNAME?.trim() || '';

const WP_APP_PASSWORD =
  process.env.WP_APP_PASSWORD?.trim() || '';

const MAX_FILE_SIZE =
  20 * 1024 * 1024;

function getWooAuth() {
  return `Basic ${Buffer.from(
    `${WOO_KEY}:${WOO_SECRET}`,
  ).toString('base64')}`;
}

function getWordPressAuth() {
  return `Basic ${Buffer.from(
    `${WP_USERNAME}:${WP_APP_PASSWORD}`,
  ).toString('base64')}`;
}

function getWordPressRestBaseUrl() {
  const configured =
    process.env.NEXT_PUBLIC_WORDPRESS_URL?.trim();

  if (configured) {
    const normalized =
      configured.replace(/\/+$/, '');

    if (normalized.endsWith('/wp-json')) {
      return normalized;
    }

    return `${normalized}/wp-json`;
  }

  const wooApi =
    WOO_API.replace(/\/+$/, '');

  const match =
    wooApi.match(
      /^(.*\/wp-json)(?:\/wc\/v3)?$/,
    );

  if (match?.[1]) {
    return match[1];
  }

  throw new Error(
    'WordPress REST API URL could not be resolved.',
  );
}

async function updateOrderPdfMeta(
  orderId: number,
  url: string,
  name: string,
) {
  const response =
    await fetch(
      `${WOO_API}/orders/${orderId}`,
      {
        method: 'PUT',

        headers: {
          Authorization:
            getWooAuth(),

          'Content-Type':
            'application/json',

          Accept:
            'application/json',
        },

        body:
          JSON.stringify({
            meta_data: [
              {
                key:
                  '_regitamin_diet_pdf_url',
                value: url,
              },
              {
                key:
                  '_regitamin_diet_pdf_name',
                value: name,
              },
              {
                key:
                  '_regitamin_diet_pdf_uploaded_at',
                value:
                  String(Date.now()),
              },
            ],
          }),

        cache: 'no-store',
      },
    );

  if (!response.ok) {
    const text =
      await response.text();

    console.error(
      'Woo PDF meta update failed:',
      text,
    );

    throw new Error(
      'ORDER_META_UPDATE_FAILED',
    );
  }

  return response.json();
}

export async function POST(
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
    await requireAdmin();

    if (
      !WOO_API ||
      !WOO_KEY ||
      !WOO_SECRET
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            'تنظیمات WooCommerce کامل نیست.',
        },
        { status: 500 },
      );
    }

    if (
      !WP_USERNAME ||
      !WP_APP_PASSWORD
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            'تنظیمات اتصال به WordPress برای آپلود فایل کامل نیست.',
        },
        { status: 500 },
      );
    }

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
          success: false,
          message:
            'شناسه سفارش نامعتبر است.',
        },
        { status: 400 },
      );
    }

    await getAdminOrder(
      orderId,
    );

    const formData =
      await request.formData();

    const uploaded =
      formData.get('file');

    if (
      !(uploaded instanceof File)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            'فایلی دریافت نشد.',
        },
        { status: 400 },
      );
    }

    if (
      uploaded.size <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            'فایل خالی است.',
        },
        { status: 400 },
      );
    }

    if (
      uploaded.size >
      MAX_FILE_SIZE
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            'حداکثر حجم فایل ۲۰ مگابایت است.',
        },
        { status: 413 },
      );
    }

    if (
      uploaded.type !==
      'application/pdf'
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            'فقط فایل PDF مجاز است.',
        },
        { status: 400 },
      );
    }

    const arrayBuffer =
      await uploaded.arrayBuffer();

    const fileBuffer =
      Buffer.from(
        arrayBuffer,
      );

    const signature =
      fileBuffer
        .subarray(0, 4)
        .toString('utf8');

    if (
      signature !==
      '%PDF'
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            'فایل PDF معتبر نیست.',
        },
        { status: 400 },
      );
    }

    const originalName =
      uploaded.name ||
      `regitamin-order-${orderId}.pdf`;

    const safeName =
      originalName
        .replace(
          /[^a-zA-Z0-9._-]/g,
          '-',
        )
        .replace(
          /-+/g,
          '-',
        )
        .slice(
          -120,
        );

    const filename =
      `regitamin-order-${orderId}-${Date.now()}-${safeName || 'diet.pdf'}`;

    const wordpressUrl =
      `${getWordPressRestBaseUrl()}/wp/v2/media`;

    const mediaResponse =
      await fetch(
        wordpressUrl,
        {
          method: 'POST',

          headers: {
            Authorization:
              getWordPressAuth(),

            'Content-Type':
              'application/pdf',

            'Content-Disposition':
              `attachment; filename="${filename}"`,

            Accept:
              'application/json',
          },

          body:
            fileBuffer,

          cache: 'no-store',
        },
      );

    if (
      !mediaResponse.ok
    ) {
      const text =
        await mediaResponse.text();

      console.error(
        'WordPress media upload failed:',
        {
          status:
            mediaResponse.status,
          body: text,
        },
      );

      return NextResponse.json(
        {
          success: false,
          message:
            'آپلود فایل در WordPress انجام نشد.',
        },
        { status: 502 },
      );
    }

    const media =
      await mediaResponse.json();

    const mediaUrl =
      String(
        media?.source_url || '',
      );

    if (!mediaUrl) {
      return NextResponse.json(
        {
          success: false,
          message:
            'آدرس فایل آپلودشده دریافت نشد.',
        },
        { status: 502 },
      );
    }

    await updateOrderPdfMeta(
      orderId,
      mediaUrl,
      originalName,
    );

    const order =
      await getAdminOrder(
        orderId,
      );

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error(
      'Admin PDF upload error:',
      error,
    );

    if (
      error instanceof Error &&
      error.message ===
        'ADMIN_UNAUTHORIZED'
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            'دسترسی غیرمجاز است.',
        },
        { status: 401 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          'آپلود PDF انجام نشد.',
      },
      { status: 500 },
    );
  }
}