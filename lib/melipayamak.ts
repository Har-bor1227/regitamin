// lib/melipayamak.ts

const MELIPAYAMAK_USERNAME =
  process.env.MELIPAYAMAK_USERNAME || '';

const MELIPAYAMAK_PASSWORD =
  process.env.MELIPAYAMAK_PASSWORD || '';

const MELIPAYAMAK_BODY_ID =
  process.env.MELIPAYAMAK_OTP_BODY_ID || '';

const BASE_SERVICE_URL =
  'https://rest.payamak-panel.com/api/SendSMS/BaseServiceNumber';

function assertConfigured() {
  if (
    !MELIPAYAMAK_USERNAME ||
    !MELIPAYAMAK_PASSWORD ||
    !MELIPAYAMAK_BODY_ID
  ) {
    throw new Error(
      'MeliPayamak is not configured. Set MELIPAYAMAK_USERNAME, MELIPAYAMAK_PASSWORD and MELIPAYAMAK_OTP_BODY_ID.',
    );
  }
}

export async function sendOtpSms(
  phone: string,
  code: string,
) {
  assertConfigured();

  /*
   * ملی پیامک برای BaseServiceNumber
   * پارامترهای username/password/text/to/bodyId
   * دریافت می‌کند.
   */
  const body =
    new URLSearchParams();

  body.set(
    'username',
    MELIPAYAMAK_USERNAME,
  );

  body.set(
    'password',
    MELIPAYAMAK_PASSWORD,
  );

  /*
   * برای الگوی تک‌متغیره،
   * مقدار OTP در text قرار می‌گیرد.
   */
  body.set(
    'text',
    code,
  );

  body.set(
    'to',
    phone,
  );

  body.set(
    'bodyId',
    MELIPAYAMAK_BODY_ID,
  );

  const response =
    await fetch(
      BASE_SERVICE_URL,
      {
        method: 'POST',
        headers: {
          'Content-Type':
            'application/x-www-form-urlencoded',
        },
        body,
        cache: 'no-store',
      },
    );

  const raw =
    await response.text();

  if (!response.ok) {
    throw new Error(
      `MeliPayamak HTTP error: ${response.status}`,
    );
  }

  let data: unknown;

  try {
    data = JSON.parse(raw);
  } catch {
    data = raw;
  }

  /*
   * API ملی پیامک در نسخه‌های
   * مختلف خروجی متفاوتی دارد؛
   * خطا را فقط در صورت مشخص بودن
   * صریح بررسی می‌کنیم.
   */
  if (
    typeof data === 'object' &&
    data !== null
  ) {
    const candidate =
      data as Record<
        string,
        unknown
      >;

    const status =
      candidate.status ??
      candidate.Status ??
      candidate.retStatus ??
      candidate.RetStatus;

    if (
      typeof status === 'string' &&
      status.trim() &&
      ![
        'success',
        'ok',
        '100',
      ].includes(
        status
          .toLowerCase()
          .trim(),
      )
    ) {
      /*
       * برخی نسخه‌ها status را
       * به شکل توضیح خطا برمی‌گردانند.
       */
      if (
        !/success|ok|ارسال|موفق/i.test(
          status,
        )
      ) {
        throw new Error(
          `MeliPayamak error: ${status}`,
        );
      }
    }
  }

  return data;
}