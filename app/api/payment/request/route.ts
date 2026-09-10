import {
  NextRequest,
  NextResponse,
} from 'next/server';

import { verifyToken } from '@/lib/auth-utils';
import { getServerCart } from '@/lib/cart-store';
import { getDietQuestionnaire } from '@/lib/diet-questionnaire-store';

import {
  createPaymentSession,
  setPaymentAuthority,
} from '@/lib/payment-store';

const ZARINPAL_MERCHANT_ID =
  process.env.ZARINPAL_MERCHANT_ID?.trim() || '';

const ZARINPAL_SANDBOX =
  process.env.ZARINPAL_SANDBOX === 'true';

const WOO_API =
  process.env.WOOCOMMERCE_API_URL?.trim() || '';

const WOO_KEY =
  process.env.WOOCOMMERCE_CONSUMER_KEY?.trim() || '';

const WOO_SECRET =
  process.env.WOOCOMMERCE_CONSUMER_SECRET?.trim() || '';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
  'http://localhost:3000';

const ZARINPAL_REQUEST_URL = ZARINPAL_SANDBOX
  ? 'https://sandbox.zarinpal.com/pg/v4/payment/request.json'
  : 'https://api.zarinpal.com/pg/v4/payment/request.json';

function getWooAuth() {
  return Buffer.from(
    `${WOO_KEY}:${WOO_SECRET}`,
  ).toString('base64');
}

function errorResponse(
  message: string,
  status = 400,
) {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status },
  );
}

function parsePrice(
  value: unknown,
): number {
  if (
    typeof value === 'number' &&
    Number.isFinite(value)
  ) {
    return Math.round(value);
  }

  if (
    typeof value !== 'string'
  ) {
    return 0;
  }

  const normalized = value
    .replace(/,/g, '')
    .replace(/\s/g, '')
    .replace(/[۰-۹]/g, (digit) =>
      String(
        '۰۱۲۳۴۵۶۷۸۹'.indexOf(
          digit,
        ),
      ),
    )
    .replace(/[٠-٩]/g, (digit) =>
      String(
        '٠١٢٣٤٥٦٧٨٩'.indexOf(
          digit,
        ),
      ),
    );

  const parsed = Number(normalized);

  return Number.isFinite(parsed)
    ? Math.round(parsed)
    : 0;
}

function isValidQuestionnaireSessionId(
  value: string,
) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function normalizeVirtualNetworkId(
  value: unknown,
) {
  if (
    typeof value !== 'string'
  ) {
    return '';
  }

  return value
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120);
}

async function fetchWooProducts(
  ids: number[],
  auth: string,
) {
  const url =
    `${WOO_API}/products?include=${ids.join(
      ',',
    )}&per_page=100&status=publish`;

  return fetch(url, {
    headers: {
      Authorization: `Basic ${auth}`,
      Accept: 'application/json',
    },
    cache: 'no-store',
  });
}

async function fetchWooVariation(
  productId: number,
  variationId: number,
  auth: string,
) {
  const url =
    `${WOO_API}/products/${productId}/variations/${variationId}`;

  return fetch(url, {
    headers: {
      Authorization: `Basic ${auth}`,
      Accept: 'application/json',
    },
    cache: 'no-store',
  });
}

export async function POST(
  request: NextRequest,
) {
  try {
    /*
     * =====================================================
     * 1. Server configuration
     * =====================================================
     */

    if (
      !ZARINPAL_MERCHANT_ID ||
      !WOO_API ||
      !WOO_KEY ||
      !WOO_SECRET
    ) {
      console.error(
        'Payment configuration is incomplete.',
      );

      return errorResponse(
        'تنظیمات پرداخت کامل نیست.',
        500,
      );
    }

    /*
     * =====================================================
     * 2. Authentication
     * =====================================================
     */

    const token =
      request.cookies.get(
        'auth_token',
      )?.value;

    if (!token) {
      return errorResponse(
        'برای ادامه پرداخت ابتدا وارد حساب کاربری شوید.',
        401,
      );
    }

    const payload =
      await verifyToken(token);

    if (
      !payload?.phone
    ) {
      return errorResponse(
        'نشست کاربری معتبر نیست.',
        401,
      );
    }

    const authenticatedPhone =
      payload.phone;

    /*
     * =====================================================
     * 3. Request body
     *
     * فقط اطلاعات سفارش و شناسه پرسشنامه
     * و آیدی شبکه مجازی از Client دریافت می‌شوند.
     *
     * amount / price / items از Client
     * به‌عنوان منبع حقیقت پذیرفته نمی‌شوند.
     * =====================================================
     */

    let body: unknown = {};

    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const requestBody =
      body &&
      typeof body === 'object'
        ? (body as Record<string, unknown>)
        : {};

    const virtualNetworkId =
      normalizeVirtualNetworkId(
        requestBody.virtualNetworkId,
      );

    const questionnaireSessionId =
      typeof requestBody.questionnaireSessionId ===
        'string'
        ? requestBody.questionnaireSessionId.trim()
        : '';

    if (
      virtualNetworkId.length < 3
    ) {
      return errorResponse(
        'آیدی شبکه مجازی معتبر نیست.',
      );
    }

    if (
      !isValidQuestionnaireSessionId(
        questionnaireSessionId,
      )
    ) {
      return errorResponse(
        'شناسه فرم رژیم معتبر نیست.',
      );
    }

    /*
     * =====================================================
     * 4. Questionnaire
     *
     * فقط Questionnaire متعلق به کاربر احراز‌شده
     * قابل استفاده برای پرداخت است.
     * =====================================================
     */

    const questionnaire =
      await getDietQuestionnaire({
        phone: authenticatedPhone,
        sessionId:
          questionnaireSessionId,
      });

    if (!questionnaire) {
      return errorResponse(
        'فرم اطلاعات رژیم پیدا نشد یا منقضی شده است.',
        404,
      );
    }

    if (
      questionnaire.status !==
      'completed'
    ) {
      return errorResponse(
        'ابتدا فرم اطلاعات رژیم را کامل کنید.',
        409,
      );
    }

    /*
     * =====================================================
     * 5. Server Cart
     *
     * سبد خرید فقط از Redis خوانده می‌شود.
     * =====================================================
     */

    const cart =
      await getServerCart(
        authenticatedPhone,
      );

    if (
      !Array.isArray(cart) ||
      cart.length === 0
    ) {
      return errorResponse(
        'سبد خرید خالی است.',
      );
    }

    /*
     * محدود کردن تعداد اقلام
     * برای جلوگیری از درخواست غیرعادی
     */

    if (
      cart.length > 100
    ) {
      return errorResponse(
        'تعداد اقلام سبد خرید بیش از حد مجاز است.',
      );
    }

    /*
     * =====================================================
     * 6. Validate cart structure
     * =====================================================
     */

    for (const item of cart) {
      if (
        !Number.isInteger(
          item.id,
        ) ||
        item.id <= 0
      ) {
        return errorResponse(
          'یکی از محصولات سبد خرید نامعتبر است.',
        );
      }

      if (
        !Number.isInteger(
          item.quantity,
        ) ||
        item.quantity < 1 ||
        item.quantity > 100
      ) {
        return errorResponse(
          'تعداد یکی از محصولات نامعتبر است.',
        );
      }

      if (
        item.variationId !==
          undefined &&
        item.variationId !==
          null &&
        (
          !Number.isInteger(
            item.variationId,
          ) ||
          item.variationId <= 0
        )
      ) {
        return errorResponse(
          'نوع یکی از محصولات نامعتبر است.',
        );
      }
    }

    /*
     * =====================================================
     * 7. WooCommerce
     * =====================================================
     */

    const auth =
      getWooAuth();

    const uniqueProductIds =
      Array.from(
        new Set(
          cart.map(
            (item) =>
              item.id,
          ),
        ),
      );

    const productsResponse =
      await fetchWooProducts(
        uniqueProductIds,
        auth,
      );

    if (
      !productsResponse.ok
    ) {
      const responseBody =
        await productsResponse.text();

      console.error(
        'WooCommerce products validation failed:',
        responseBody,
      );

      return errorResponse(
        'امکان بررسی محصولات در حال حاضر وجود ندارد.',
        502,
      );
    }

    const products =
      await productsResponse.json();

    if (
      !Array.isArray(products)
    ) {
      return errorResponse(
        'پاسخ نامعتبر از WooCommerce دریافت شد.',
        502,
      );
    }

    const productMap =
      new Map<number, any>();

    for (
      const product of products
    ) {
      if (
        Number.isInteger(
          product?.id,
        )
      ) {
        productMap.set(
          product.id,
          product,
        );
      }
    }

    /*
     * =====================================================
     * 8. Recalculate prices
     * =====================================================
     */

    const paymentItems: Array<{
      id: number;
      variationId?: number;
      quantity: number;
      name: string;
      priceToman: number;
      lineTotalToman: number;
    }> = [];

    let totalToman = 0;

    for (
      const cartItem of cart
    ) {
      const product =
        productMap.get(
          cartItem.id,
        );

      if (!product) {
        return errorResponse(
          `محصول «${cartItem.name}» دیگر در فروشگاه موجود نیست.`,
        );
      }

      if (
        product.status !==
        'publish'
      ) {
        return errorResponse(
          `محصول «${product.name}» قابل خرید نیست.`,
        );
      }

      let priceToman =
        parsePrice(
          product.price,
        );

      let variation:
        | any
        | null = null;

      /*
       * ================================================
       * Variable product
       * ================================================
       */

      if (
        cartItem.variationId
      ) {
        const variationResponse =
          await fetchWooVariation(
            cartItem.id,
            cartItem.variationId,
            auth,
          );

        if (
          !variationResponse.ok
        ) {
          return errorResponse(
            `تنوع انتخاب‌شده برای «${product.name}» معتبر نیست.`,
          );
        }

        variation =
          await variationResponse.json();

        if (
          Number(
            variation?.product_id,
          ) !==
          cartItem.id
        ) {
          return errorResponse(
            `تنوع انتخاب‌شده برای «${product.name}» معتبر نیست.`,
          );
        }

        if (
          variation.status ===
          'private'
        ) {
          return errorResponse(
            `تنوع انتخاب‌شده برای «${product.name}» قابل خرید نیست.`,
          );
        }

        if (
          variation.stock_status !==
          'instock'
        ) {
          return errorResponse(
            `«${product.name}» در این تنوع موجود نیست.`,
          );
        }

        priceToman =
          parsePrice(
            variation.price,
          );
      } else {
        /*
         * ================================================
         * Simple product
         * ================================================
         */

        if (
          product.stock_status ===
          'outofstock'
        ) {
          return errorResponse(
            `«${product.name}» موجود نیست.`,
          );
        }
      }

      if (
        priceToman <= 0
      ) {
        return errorResponse(
          `قیمت «${product.name}» معتبر نیست.`,
        );
      }

      /*
       * بررسی موجودی واقعی
       */

      const stockQuantity =
        variation?.manage_stock
          ? variation.stock_quantity
          : product.manage_stock
            ? product.stock_quantity
            : null;

      if (
        stockQuantity !== null &&
        stockQuantity !==
          undefined &&
        Number.isFinite(
          Number(
            stockQuantity,
          ),
        ) &&
        cartItem.quantity >
          Number(stockQuantity)
      ) {
        return errorResponse(
          `تعداد «${product.name}» بیشتر از موجودی فعلی است.`,
        );
      }

      const lineTotalToman =
        priceToman *
        cartItem.quantity;

      totalToman +=
        lineTotalToman;

      paymentItems.push({
        id: product.id,

        ...(cartItem.variationId
          ? {
              variationId:
                cartItem.variationId,
            }
          : {}),

        quantity:
          cartItem.quantity,

        name:
          String(
            product.name ||
              cartItem.name,
          ),

        priceToman,

        lineTotalToman,
      });
    }

    /*
     * =====================================================
     * 9. Final server amount
     * =====================================================
     */

    totalToman =
      Math.round(
        totalToman,
      );

    if (
      totalToman <= 0
    ) {
      return errorResponse(
        'مبلغ سفارش معتبر نیست.',
      );
    }

    /*
     * WooCommerce values in this project
     * are treated as Toman.
     *
     * ZarinPal expects Rial.
     */

    const amountRials =
      totalToman * 10;

    if (
      !Number.isSafeInteger(
        amountRials,
      )
    ) {
      return errorResponse(
        'مبلغ تراکنش بیش از حد مجاز است.',
      );
    }

    /*
     * =====================================================
     * 10. Create server-side Payment Session
     *
     * Questionnaire ID و Virtual Network ID
     * در Session ذخیره می‌شوند.
     *
     * خود پاسخ‌های پرسشنامه داخل Payment Session
     * کپی نمی‌شوند.
     * =====================================================
     */

    const session =
      await createPaymentSession({
        phone:
          authenticatedPhone,

        customerId:
          typeof payload.customerId === 'number' &&
          Number.isInteger(
            payload.customerId,
          ) &&
          payload.customerId > 0
            ? payload.customerId
            : undefined,

        amountToman:
          totalToman,

        amountRials,

        items:
          paymentItems,

        metadata: {
          virtualNetworkId,
          questionnaireSessionId,
        },
      });

    /*
     * =====================================================
     * 11. ZarinPal request
     * =====================================================
     */

    const callbackUrl =
      `${SITE_URL}/payment/callback`;

    const zarinpalResponse =
      await fetch(
        ZARINPAL_REQUEST_URL,
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
              amountRials,

            callback_url:
              callbackUrl,

            description:
              `خرید از رژیتامین - ${session.id}`,

            metadata: {
              mobile:
                authenticatedPhone,
            },
          }),

          cache: 'no-store',
        },
      );

    if (
      !zarinpalResponse.ok
    ) {
      const raw =
        await zarinpalResponse.text();

      console.error(
        'ZarinPal HTTP error:',
        raw,
      );

      return errorResponse(
        'ارتباط با درگاه پرداخت برقرار نشد.',
        502,
      );
    }

    const zarinpalData =
      await zarinpalResponse.json();

    const authority =
      zarinpalData?.data
        ?.authority;

    const zarinpalCode =
      Number(
        zarinpalData?.data
          ?.code,
      );

    if (
      zarinpalCode !== 100 ||
      !authority
    ) {
      console.error(
        'ZarinPal request failed:',
        zarinpalData,
      );

      return errorResponse(
        'خطا در ایجاد تراکنش پرداخت.',
        502,
      );
    }

    /*
     * =====================================================
     * 12. Bind Authority → Payment Session
     * =====================================================
     */

    await setPaymentAuthority(
      session.id,
      String(authority),
    );

    const paymentUrl =
      ZARINPAL_SANDBOX
        ? `https://sandbox.zarinpal.com/pg/StartPay/${authority}`
        : `https://www.zarinpal.com/pg/StartPay/${authority}`;

    /*
     * مقدار amount را به Client برنمی‌گردانیم.
     */

    return NextResponse.json({
      success: true,
      paymentUrl,
      authority:
        String(authority),
    });
  } catch (error) {
    console.error(
      'Payment request error:',
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error:
          'خطایی هنگام ایجاد پرداخت رخ داد.',
      },
      { status: 500 },
    );
  }
}