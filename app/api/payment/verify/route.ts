import {
  NextRequest,
  NextResponse,
} from 'next/server';

import {
  verifyToken,
} from '@/lib/auth-utils';

import {
  getPaymentSessionByAuthority,
  claimPaymentSession,
  completePaymentSession,
  failPaymentSession,
} from '@/lib/payment-store';

import {
  getDietQuestionnaire,
} from '@/lib/diet-questionnaire-store';

const ZARINPAL_MERCHANT_ID =
  process.env.ZARINPAL_MERCHANT_ID || '';

const ZARINPAL_SANDBOX =
  process.env.ZARINPAL_SANDBOX === 'true';

const WOO_API =
  process.env.WOOCOMMERCE_API_URL || '';

const WOO_KEY =
  process.env.WOOCOMMERCE_CONSUMER_KEY || '';

const WOO_SECRET =
  process.env.WOOCOMMERCE_CONSUMER_SECRET || '';

const ZARINPAL_VERIFY_URL =
  ZARINPAL_SANDBOX
    ? 'https://sandbox.zarinpal.com/pg/v4/payment/verify.json'
    : 'https://api.zarinpal.com/pg/v4/payment/verify.json';

function getWooAuth() {
  return Buffer.from(
    `${WOO_KEY}:${WOO_SECRET}`,
  ).toString('base64');
}

function buildQuestionnaireMeta(
  questionnaire: {
    id: string;
    version: number;
    answers: Record<string, unknown>;
    completedAt?: number;
  },
) {
  return [
    {
      key:
        '_regitamin_questionnaire_session',
      value:
        questionnaire.id,
    },

    {
      key:
        '_regitamin_questionnaire_version',
      value:
        String(
          questionnaire.version,
        ),
    },

    {
      key:
        '_regitamin_questionnaire_answers',
      value:
        JSON.stringify(
          questionnaire.answers,
        ),
    },

    {
      key:
        '_regitamin_questionnaire_completed_at',
      value:
        questionnaire.completedAt
          ? String(
              questionnaire.completedAt,
            )
          : '',
    },
  ];
}

async function getOrCreateCustomer(
  phone: string,
) {
  const auth =
    getWooAuth();

  const searchResponse =
    await fetch(
      `${WOO_API}/customers?search=${encodeURIComponent(
        phone,
      )}&per_page=100`,
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
        cache: 'no-store',
      },
    );

  if (
    searchResponse.ok
  ) {
    const customers =
      await searchResponse.json();

    if (
      Array.isArray(
        customers,
      )
    ) {
      const existing =
        customers.find(
          (customer: any) =>
            String(
              customer.phone ||
                '',
            ) === phone,
        );

      if (existing) {
        return existing.id;
      }
    }
  }

  const createResponse =
    await fetch(
      `${WOO_API}/customers`,
      {
        method: 'POST',

        headers: {
          Authorization:
            `Basic ${auth}`,

          'Content-Type':
            'application/json',
        },

        body: JSON.stringify({
          username:
            phone,

          phone,

          first_name:
            'کاربر',

          last_name:
            'رژیتامین',
        }),

        cache: 'no-store',
      },
    );

  if (
    !createResponse.ok
  ) {
    const body =
      await createResponse.text();

    console.error(
      'Woo customer creation failed:',
      body,
    );

    return 0;
  }

  const customer =
    await createResponse.json();

  return Number(
    customer.id || 0,
  );
}

async function findExistingOrder(
  authority: string,
) {
  const auth =
    getWooAuth();

  const response =
    await fetch(
      `${WOO_API}/orders?per_page=100&page=1&orderby=date&order=desc`,
      {
        headers: {
          Authorization:
            `Basic ${auth}`,

          Accept:
            'application/json',
        },

        cache: 'no-store',
      },
    );

  if (
    !response.ok
  ) {
    return null;
  }

  const orders =
    await response.json();

  if (
    !Array.isArray(orders)
  ) {
    return null;
  }

  const existingOrder =
    orders.find(
      (order: any) =>
        String(
          order?.transaction_id ||
            '',
        ).trim() === authority,
    );

  return existingOrder || null;
}

async function updateWooOrderMeta(
  orderId: number,
  metaData: Array<{
    key: string;
    value: string;
  }>,
) {
  const response =
    await fetch(
      `${WOO_API}/orders/${orderId}`,
      {
        method: 'PUT',

        headers: {
          Authorization:
            `Basic ${getWooAuth()}`,

          'Content-Type':
            'application/json',

          Accept:
            'application/json',
        },

        body:
          JSON.stringify({
            meta_data:
              metaData,
          }),

        cache: 'no-store',
      },
    );

  if (!response.ok) {
    const body =
      await response.text();

    console.error(
      'WooCommerce order meta update failed:',
      body,
    );

    return false;
  }

  return true;
}

export async function POST(
  request: NextRequest,
) {
  try {
    const body =
      await request.json();

    const authority =
      String(
        body?.authority || '',
      ).trim();

    /*
     * amount و items عمداً نادیده گرفته می‌شوند.
     * منبع حقیقت Payment Session در Redis است.
     */

    if (!authority) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Authority معتبر نیست.',
        },
        { status: 400 },
      );
    }

    const session =
      await getPaymentSessionByAuthority(
        authority,
      );

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message:
            'نشست پرداخت پیدا نشد یا منقضی شده است.',
        },
        { status: 404 },
      );
    }

    if (
      session.status ===
      'completed'
    ) {
      return NextResponse.json({
        success: true,

        refId:
          session.refId || '',

        orderId:
          session.orderId || null,

        message:
          'این پرداخت قبلاً با موفقیت ثبت شده است.',
      });
    }

    if (
      Date.now() >
      session.expiresAt
    ) {
      await failPaymentSession(
        session.id,
      );

      return NextResponse.json(
        {
          success: false,
          message:
            'نشست پرداخت منقضی شده است.',
        },
        { status: 410 },
      );
    }

    /*
     * فقط مالک Session اجازه Verify دارد.
     */

    const token =
      request.cookies.get(
        'auth_token',
      )?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message:
            'نشست کاربری معتبر نیست.',
        },
        { status: 401 },
      );
    }

    const payload =
      await verifyToken(token);

    if (
      !payload ||
      payload.phone !==
        session.phone
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            'دسترسی به این تراکنش مجاز نیست.',
        },
        { status: 403 },
      );
    }

    /*
     * =====================================================
     * Questionnaire
     *
     * Questionnaire باید متعلق به همان کاربر
     * و تکمیل‌شده باشد.
     *
     * نکته:
     * اگر به هر دلیل Redis Questionnaire از بین رفته
     * باشد، Payment Session را failed نمی‌کنیم؛
     * چون ممکن است تراکنش در زرین‌پال واقعاً موفق شده باشد.
     * Session در وضعیت processing می‌ماند تا قابل retry باشد.
     * =====================================================
     */

    const questionnaire =
      await getDietQuestionnaire({
        phone:
          session.phone,

        sessionId:
          session.metadata
            .questionnaireSessionId,
      });

    if (!questionnaire) {
      return NextResponse.json(
        {
          success: false,
          message:
            'اطلاعات فرم رژیم پیدا نشد. لطفاً عملیات تأیید را دوباره انجام دهید.',
        },
        { status: 409 },
      );
    }

    if (
      questionnaire.status !==
      'completed'
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            'فرم رژیم هنوز تکمیل نشده است.',
        },
        { status: 409 },
      );
    }

    /*
     * =====================================================
     * جلوگیری از Callbackهای همزمان
     * =====================================================
     */

    const claim =
      await claimPaymentSession(
        session.id,
      );

    if (
      claim ===
      'completed'
    ) {
      const latest =
        await getPaymentSessionByAuthority(
          authority,
        );

      return NextResponse.json({
        success: true,

        refId:
          latest?.refId || '',

        orderId:
          latest?.orderId || null,

        message:
          'پرداخت قبلاً ثبت شده است.',
      });
    }

    if (
      claim ===
      'processing'
    ) {
      const latestSession =
        await getPaymentSessionByAuthority(
          authority,
        );

      if (
        latestSession?.status ===
        'completed'
      ) {
        return NextResponse.json({
          success: true,

          status:
            'completed',

          refId:
            latestSession.refId || '',

          orderId:
            latestSession.orderId || null,

          message:
            'پرداخت با موفقیت انجام شد و سفارش شما ثبت شده است.',
        });
      }

      return NextResponse.json({
        success: true,

        status:
          'processing',

        message:
          'تراکنش در حال بررسی است.',
      });
    }

    /*
     * =====================================================
     * Verify با مبلغ ذخیره‌شده در Redis
     * =====================================================
     */

    const verifyResponse =
      await fetch(
        ZARINPAL_VERIFY_URL,
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',

            Accept:
              'application/json',
          },

          body: JSON.stringify({
            merchant_id:
              ZARINPAL_MERCHANT_ID,

            amount:
              session.amountRials,

            authority,
          }),

          cache: 'no-store',
        },
      );

    const verifyData =
      await verifyResponse.json();

    const verifyCode =
      verifyData.data?.code;

    if (
      verifyCode !== 100 &&
      verifyCode !== 101
    ) {
      await failPaymentSession(
        session.id,
      );

      return NextResponse.json({
        success: false,

        message:
          verifyData.errors
            ?.message ||
          'پرداخت تأیید نشد.',
      });
    }

    /*
     * =====================================================
     * اگر قبلاً Order ساخته شده باشد
     * دوباره نساز.
     * =====================================================
     */

    const existingOrder =
      await findExistingOrder(
        authority,
      );

    if (existingOrder) {
      const refId =
        String(
          verifyData.data
            ?.ref_id || '',
        );

      /*
       * Questionnaire Meta را حتی در مسیر
       * existingOrder نیز ثبت/به‌روزرسانی می‌کنیم.
       */

      await updateWooOrderMeta(
        Number(
          existingOrder.id,
        ),
        buildQuestionnaireMeta(
          questionnaire,
        ),
      );

      await completePaymentSession(
        session.id,

        Number(
          existingOrder.id,
        ),

        refId,
      );

      return NextResponse.json({
        success: true,

        refId,

        orderId:
          existingOrder.id,

        message:
          'پرداخت با موفقیت انجام شد و سفارش شما ثبت شده است.',
      });
    }

    /*
     * =====================================================
     * Customer
     * =====================================================
     */

    let customerId =
      session.customerId ||
      0;

    if (!customerId) {
      customerId =
        await getOrCreateCustomer(
          session.phone,
        );
    }

    const finalCustomerId =
      Number(
        session.customerId ||
          customerId ||
          0,
      );

    /*
     * =====================================================
     * Line Items
     * =====================================================
     */

    const lineItems =
      session.items.map(
        (item) => ({
          product_id:
            item.id,

          ...(item.variationId
            ? {
                variation_id:
                  item.variationId,
              }
            : {}),

          quantity:
            item.quantity,
        }),
      );

    /*
     * =====================================================
     * Questionnaire Meta
     * =====================================================
     */

    const questionnaireMeta =
      buildQuestionnaireMeta(
        questionnaire,
      );

    /*
     * =====================================================
     * WooCommerce Order
     * =====================================================
     */

    const orderData: Record<
      string,
      unknown
    > = {
      payment_method:
        'zarinpal',

      payment_method_title:
        'زرین‌پال',

      set_paid:
        true,

      status:
        'processing',

      transaction_id:
        authority,

      line_items:
        lineItems,

      billing: {
        phone:
          session.phone,

        first_name:
          'کاربر',

        last_name:
          'رژیتامین',

        address_1:
          session.metadata
            .address,

        postcode:
          session.metadata
            .postalCode,
      },

      meta_data: [
        {
          key:
            '_regitamin_payment_session',

          value:
            session.id,
        },

        {
          key:
            '_regitamin_paid_amount_toman',

          value:
            String(
              session.amountToman,
            ),
        },

        ...questionnaireMeta,
      ],
    };

    if (
      Number.isInteger(
        finalCustomerId,
      ) &&
      finalCustomerId > 0
    ) {
      orderData.customer_id =
        finalCustomerId;
    }

    /*
     * =====================================================
     * Create WooCommerce Order
     * =====================================================
     */

    const orderResponse =
      await fetch(
        `${WOO_API}/orders`,
        {
          method: 'POST',

          headers: {
            Authorization:
              `Basic ${getWooAuth()}`,

            'Content-Type':
              'application/json',

            Accept:
              'application/json',
          },

          body:
            JSON.stringify(
              orderData,
            ),

          cache: 'no-store',
        },
      );

    if (
      !orderResponse.ok
    ) {
      const errorText =
        await orderResponse.text();

      console.error(
        'WooCommerce order creation failed:',
        errorText,
      );

      /*
       * Payment موفق بوده ولی ساخت Order
       * ناموفق شده است.
       *
       * Session را completed نمی‌کنیم تا
       * امکان retry وجود داشته باشد.
       */

      return NextResponse.json(
        {
          success: false,

          message:
            'پرداخت موفق بود اما ثبت سفارش انجام نشد. اطلاعات تراکنش ثبت شده است.',
        },
        { status: 502 },
      );
    }

    const order =
      await orderResponse.json();

    const refId =
      String(
        verifyData.data
          ?.ref_id || '',
      );

    /*
     * =====================================================
     * Complete Payment Session
     * =====================================================
     */

    await completePaymentSession(
      session.id,

      Number(
        order.id,
      ),

      refId,
    );

    return NextResponse.json({
      success: true,

      refId,

      orderId:
        order.id,

      message:
        'پرداخت با موفقیت انجام شد و سفارش شما ثبت گردید.',
    });
  } catch (error) {
    console.error(
      'Payment verify error:',
      error,
    );

    return NextResponse.json(
      {
        success: false,

        message:
          'خطایی هنگام تأیید پرداخت رخ داد.',
      },
      { status: 500 },
    );
  }
}