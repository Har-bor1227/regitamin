'use server';

import {
  cookies,
  headers,
} from 'next/headers';

import {
  SignJWT,
} from 'jose';

import {
  generateAndStoreOtp,
  verifyAndConsumeOtp,
} from '@/lib/otp-store';

import {
  checkRateLimit,
} from '@/lib/rate-limiter';

import {
  sendOtpSms,
} from '@/lib/melipayamak';

const JWT_SECRET_VALUE =
  process.env.JWT_SECRET;

if (!JWT_SECRET_VALUE) {
  throw new Error(
    'JWT_SECRET is not configured.',
  );
}

if (
  JWT_SECRET_VALUE.length < 32
) {
  throw new Error(
    'JWT_SECRET must be at least 32 characters long.',
  );
}

const JWT_SECRET =
  new TextEncoder().encode(
    JWT_SECRET_VALUE,
  );

function normalizeIranPhone(
  value: string,
) {
  return value
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
    )
    .replace(/\s+/g, '')
    .trim();
}

function getClientIp(
  headersList: Headers,
) {
  const forwarded =
    headersList.get(
      'x-forwarded-for',
    );

  if (forwarded) {
    return forwarded
      .split(',')[0]
      .trim();
  }

  return (
    headersList.get(
      'x-real-ip',
    ) || 'unknown'
  );
}

function validatePhone(
  phone: string,
) {
  return /^09\d{9}$/.test(
    phone,
  );
}

async function getOrCreateWooCustomer(
  phone: string,
) {
  const apiUrl =
    process.env.WOOCOMMERCE_API_URL;

  const consumerKey =
    process.env
      .WOOCOMMERCE_CONSUMER_KEY;

  const consumerSecret =
    process.env
      .WOOCOMMERCE_CONSUMER_SECRET;

  if (
    !apiUrl ||
    !consumerKey ||
    !consumerSecret
  ) {
    throw new Error(
      'WooCommerce credentials are not configured.',
    );
  }

  const auth = Buffer.from(
    `${consumerKey}:${consumerSecret}`,
  ).toString(
    'base64',
  );

  /*
   * ابتدا کاربر موجود را پیدا می‌کنیم.
   *
   * در جستجوی اول، رفتار قبلی حفظ شده و بر اساس
   * شماره موبایل بررسی می‌شود.
   */
  const searchResponse =
    await fetch(
      `${apiUrl}/customers?search=${encodeURIComponent(
        phone,
      )}&per_page=100`,
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
        cache: 'no-store',
      },
    );

  if (searchResponse.ok) {
    const customers =
      await searchResponse.json();

    if (
      Array.isArray(
        customers,
      )
    ) {
      const customer =
        customers.find(
          (item: any) =>
            String(
              item.phone || '',
            ) === phone,
        );

      if (customer) {
        return customer.id;
      }
    }
  }

  const email =
    `${phone}@rejitamin.local`;

  /*
   * ممکن است WooCommerce شماره تلفن را
   * در پاسخ search پیدا نکند، اما username یا
   * email همین کاربر قبلاً ثبت شده باشد.
   *
   * این دو lookup فقط برای جلوگیری از ساخت
   * Customer تکراری انجام می‌شوند.
   */
  const usernameResponse =
    await fetch(
      `${apiUrl}/customers?username=${encodeURIComponent(
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
    usernameResponse.ok
  ) {
    const customers =
      await usernameResponse.json();

    if (
      Array.isArray(
        customers,
      )
    ) {
      const customer =
        customers.find(
          (item: any) =>
            String(
              item.username || '',
            ) === phone,
        );

      if (customer) {
        return customer.id;
      }
    }
  }

  const emailResponse =
    await fetch(
      `${apiUrl}/customers?email=${encodeURIComponent(
        email,
      )}&per_page=100`,
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
        cache: 'no-store',
      },
    );

  if (
    emailResponse.ok
  ) {
    const customers =
      await emailResponse.json();

    if (
      Array.isArray(
        customers,
      )
    ) {
      const customer =
        customers.find(
          (item: any) =>
            String(
              item.email || '',
            ).toLowerCase() ===
            email.toLowerCase(),
        );

      if (customer) {
        return customer.id;
      }
    }
  }

  const createResponse =
    await fetch(
      `${apiUrl}/customers`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type':
            'application/json',
        },
        body: JSON.stringify({
          username: phone,
          email,
          phone,
          first_name: 'کاربر',
          last_name: 'رژیتامین',
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
      {
        status: createResponse.status,
        statusText: createResponse.statusText,
        body,
        phone,
      },
    );

    /*
     * اگر درخواست دیگری همزمان این Customer
     * را ساخته باشد، یک بار دیگر Customer
     * موجود را پیدا می‌کنیم.
     */
    const retryResponse =
      await fetch(
        `${apiUrl}/customers?search=${encodeURIComponent(
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
      retryResponse.ok
    ) {
      const customers =
        await retryResponse.json();

      if (
        Array.isArray(
          customers,
        )
      ) {
        const customer =
          customers.find(
            (item: any) =>
              String(
                item.phone || '',
              ) === phone ||
              String(
                item.username || '',
              ) === phone ||
              String(
                item.email || '',
              ).toLowerCase() ===
                email.toLowerCase(),
          );

        if (customer) {
          return customer.id;
        }
      }
    }

    throw new Error(
      `WooCommerce customer creation failed: ${createResponse.status}`,
    );
  }

  const customer =
    await createResponse.json();

  return customer.id || null;
}

export async function sendOtpAction(
  rawPhone: string,
): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const phone =
      normalizeIranPhone(
        rawPhone,
      );

    if (
      !validatePhone(phone)
    ) {
      return {
        success: false,
        message:
          'شماره تلفن معتبر وارد کنید.',
      };
    }

    const headersList =
      await headers();

    const ip =
      getClientIp(
        headersList,
      );

    /*
     * هم IP و هم شماره تلفن
     * محدود می‌شوند.
     */
    const phoneAllowed =
      await checkRateLimit(
        `regitamin:otp:phone:${phone}`,
      );

    const ipAllowed =
      await checkRateLimit(
        `regitamin:otp:ip:${ip}`,
      );

    if (
      !phoneAllowed ||
      !ipAllowed
    ) {
      return {
        success: false,
        message:
          'تعداد درخواست‌ها بیش از حد مجاز است. لطفاً چند دقیقه دیگر تلاش کنید.',
      };
    }

    const code =
      await generateAndStoreOtp(
        phone,
      );

    await sendOtpSms(
      phone,
      code,
    );

    return {
      success: true,
      message:
        'کد تأیید برای شما ارسال شد.',
    };
  } catch (error) {
    console.error(
      'Send OTP error:',
      error,
    );

    return {
      success: false,
      message:
        'ارسال کد تأیید انجام نشد. لطفاً دوباره تلاش کنید.',
    };
  }
}

export async function verifyOtpAndLogin(
  rawPhone: string,
  rawOtp: string,
): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const phone =
      normalizeIranPhone(
        rawPhone,
      );

    const otp =
      rawOtp.replace(
        /\D/g,
        '',
      );

    if (
      !validatePhone(phone) ||
      !/^\d{5}$/.test(
        otp,
      )
    ) {
      return {
        success: false,
        message:
          'شماره تلفن یا کد تأیید نامعتبر است.',
      };
    }

    const valid =
      await verifyAndConsumeOtp(
        phone,
        otp,
      );

    if (!valid) {
      return {
        success: false,
        message:
          'کد تأیید اشتباه یا منقضی شده است.',
      };
    }

    const customerId =
      await getOrCreateWooCustomer(
        phone,
      );

    const tokenPayload: {
      phone: string;
      customerId?: number;
    } = {
      phone,
    };

    if (
      typeof customerId ===
        'number' &&
      customerId > 0
    ) {
      tokenPayload.customerId =
        customerId;
    }

    const token =
      await new SignJWT(
        tokenPayload,
      )
        .setProtectedHeader({
          alg: 'HS256',
          typ: 'JWT',
        })
        .setIssuedAt()
        .setExpirationTime(
          '7d',
        )
        .sign(
          JWT_SECRET,
        );

    const cookieStore =
      await cookies();

    cookieStore.set(
      'auth_token',
      token,
      {
        httpOnly: true,
        secure:
          process.env
            .NODE_ENV ===
          'production',
        sameSite: 'lax',
        maxAge:
          60 * 60 * 24 * 7,
        path: '/',
      },
    );

    /*
     * دیگر user_phone را منبع Auth
     * نمی‌دانیم. این cookie فقط
     * برای سازگاری UI فعلی نگه داشته می‌شود.
     */
    cookieStore.set(
      'user_phone',
      phone,
      {
        httpOnly: false,
        secure:
          process.env
            .NODE_ENV ===
          'production',
        sameSite: 'lax',
        maxAge:
          60 * 60 * 24 * 7,
        path: '/',
      },
    );

    return {
      success: true,
      message:
        'ورود با موفقیت انجام شد.',
    };
  } catch (error) {
    console.error(
      'Verify OTP error:',
      error,
    );

    return {
      success: false,
      message:
        'خطایی هنگام ورود رخ داد. لطفاً دوباره تلاش کنید.',
    };
  }
}

export async function logout() {
  const cookieStore =
    await cookies();

  cookieStore.delete(
    'auth_token',
  );

  cookieStore.delete(
    'user_phone',
  );

  return {
    success: true,
  };
}