// lib/payment-store.ts

import { randomUUID } from 'node:crypto';

import {
  redisGet,
  redisSet,
  redisEval,
} from '@/lib/redis';

/* =========================================================
   Types
   ========================================================= */

export type PaymentSessionStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed';

export interface PaymentSessionItem {
  id: number;
  variationId?: number;
  quantity: number;
  name: string;

  /**
   * قیمت واقعی که Server از WooCommerce
   * در زمان ایجاد Payment Session به‌دست آورده است.
   *
   * این مقدار از Client دریافت نمی‌شود.
   */
  priceToman: number;

  lineTotalToman: number;
}

export interface PaymentSessionMetadata {

  address: string;
  postalCode: string;

  questionnaireSessionId: string;
}
export interface PaymentSession {
  id: string;

  /**
   * Authority برگشتی زرین‌پال
   */
  authority?: string;

  /**
   * شماره موبایل کاربر احراز هویت‌شده
   */
  phone: string;

  /**
   * در صورت نیاز، Customer ID ووکامرس
   */
  customerId?: number;

  /**
   * مبلغ نهایی محاسبه‌شده توسط Server
   */
  amountToman: number;

  /**
   * مبلغ ارسالی به زرین‌پال
   * به ریال
   */
  amountRials: number;

  /**
   * اقلام اعتبارسنجی‌شده توسط Server
   */
  items: PaymentSessionItem[];

  /**
   * اطلاعات دریافت سفارش
   */
  metadata: PaymentSessionMetadata;

  /**
   * وضعیت Session
   */
  status: PaymentSessionStatus;

  /**
   * زمان ایجاد Session
   */
  createdAt: number;

  /**
   * زمان انقضای Session
   */
  expiresAt: number;

  /**
   * Order ساخته‌شده در WooCommerce
   */
  orderId?: number;

  /**
   * کد پیگیری زرین‌پال
   */
  refId?: string;
}

/* =========================================================
   Constants
   ========================================================= */

/**
 * Session پرداخت حداکثر ۲۰ دقیقه معتبر است.
 */
const PAYMENT_TTL_SECONDS = 20 * 60;

/* =========================================================
   Redis Keys
   ========================================================= */

function getSessionKey(
  sessionId: string,
): string {
  return `regitamin:payment:${sessionId}`;
}

function getAuthorityKey(
  authority: string,
): string {
  return `regitamin:payment:authority:${authority}`;
}

/* =========================================================
   Create Session
   ========================================================= */

export async function createPaymentSession(
  input: Omit<
    PaymentSession,
    | 'id'
    | 'createdAt'
    | 'expiresAt'
    | 'status'
  >,
): Promise<PaymentSession> {
  const now = Date.now();

  const session: PaymentSession = {
    ...input,

    id: randomUUID(),

    status: 'pending',

    createdAt: now,

    expiresAt:
      now +
      PAYMENT_TTL_SECONDS *
        1000,
  };

  await redisSet(
    getSessionKey(
      session.id,
    ),
    JSON.stringify(session),
    PAYMENT_TTL_SECONDS,
  );

  return session;
}

/* =========================================================
   Get Session
   ========================================================= */

export async function getPaymentSession(
  sessionId: string,
): Promise<PaymentSession | null> {
  if (!sessionId) {
    return null;
  }

  const raw =
    await redisGet<string>(
      getSessionKey(
        sessionId,
      ),
    );

  if (!raw) {
    return null;
  }

  try {
    const session =
      JSON.parse(raw);

    if (
      !session ||
      typeof session !==
        'object'
    ) {
      return null;
    }

    return session as PaymentSession;
  } catch (error) {
    console.error(
      'Failed to parse payment session:',
      error,
    );

    return null;
  }
}

/* =========================================================
   Set Authority
   ========================================================= */

export async function setPaymentAuthority(
  sessionId: string,
  authority: string,
): Promise<void> {
  if (
    !sessionId ||
    !authority
  ) {
    throw new Error(
      'Session ID and authority are required.',
    );
  }

  const session =
    await getPaymentSession(
      sessionId,
    );

  if (!session) {
    throw new Error(
      'Payment session not found.',
    );
  }

  /*
   * Authority فقط در صورتی اضافه می‌شود
   * که Session هنوز معتبر باشد.
   */
  if (
    Date.now() >
    session.expiresAt
  ) {
    throw new Error(
      'Payment session has expired.',
    );
  }

  session.authority =
    authority;

  await redisSet(
    getSessionKey(
      sessionId,
    ),
    JSON.stringify(session),
    PAYMENT_TTL_SECONDS,
  );

  /*
   * Mapping:
   *
   * Authority
   *    ↓
   * Session ID
   *
   * برای پیدا کردن Session در Callback.
   */
  await redisSet(
    getAuthorityKey(
      authority,
    ),
    sessionId,
    PAYMENT_TTL_SECONDS,
  );
}

/* =========================================================
   Get Session By Authority
   ========================================================= */

export async function getPaymentSessionByAuthority(
  authority: string,
): Promise<PaymentSession | null> {
  if (!authority) {
    return null;
  }

  const sessionId =
    await redisGet<string>(
      getAuthorityKey(
        authority,
      ),
    );

  if (!sessionId) {
    return null;
  }

  return getPaymentSession(
    sessionId,
  );
}

/* =========================================================
   Claim Session
   ========================================================= */

/**
 * جلوگیری از Verify همزمان.
 *
 * حالت‌ها:
 *
 * pending
 *   ↓
 * processing
 *
 * processing
 *   → processing
 *
 * completed
 *   → completed
 */
export async function claimPaymentSession(
  sessionId: string,
): Promise<
  | 'claimed'
  | 'processing'
  | 'completed'
  | ''
> {
  if (!sessionId) {
    return '';
  }

  const key =
    getSessionKey(
      sessionId,
    );

  const script = `
    local raw = redis.call("GET", KEYS[1])

    if not raw then
      return ""
    end

    local session = cjson.decode(raw)

    if session.status == "completed" then
      return "completed"
    end

    if session.status == "processing" then
      return "processing"
    end

    if session.status == "failed" then
      return ""
    end

    local now = tonumber(ARGV[2])

    if session.expiresAt and tonumber(session.expiresAt) < now then
      return ""
    end

    session.status = "processing"

    redis.call(
      "SET",
      KEYS[1],
      cjson.encode(session),
      "EX",
      ARGV[1]
    )

    return "claimed"
  `;

  try {
    const result =
      await redisEval<string>(
        script,
        [key],
        [
          String(
            PAYMENT_TTL_SECONDS,
          ),
          String(
            Date.now(),
          ),
        ],
      );

    if (
      result ===
        'claimed' ||
      result ===
        'processing' ||
      result ===
        'completed'
    ) {
      return result;
    }

    return '';
  } catch (error) {
    console.error(
      'Failed to claim payment session:',
      error,
    );

    throw error;
  }
}

/* =========================================================
   Complete Payment
   ========================================================= */

export async function completePaymentSession(
  sessionId: string,
  orderId: number,
  refId: string,
): Promise<void> {
  if (!sessionId) {
    throw new Error(
      'Session ID is required.',
    );
  }

  if (
    !Number.isInteger(
      orderId,
    ) ||
    orderId <= 0
  ) {
    throw new Error(
      'Invalid WooCommerce order ID.',
    );
  }

  const session =
    await getPaymentSession(
      sessionId,
    );

  if (!session) {
    throw new Error(
      'Payment session not found.',
    );
  }

  session.status =
    'completed';

  session.orderId =
    orderId;

  session.refId =
    refId;

  await redisSet(
    getSessionKey(
      sessionId,
    ),
    JSON.stringify(session),
    PAYMENT_TTL_SECONDS,
  );

  /*
   * Authority mapping را هم زنده نگه می‌داریم
   * تا Callback دوباره همان Session را پیدا کند.
   */
  if (session.authority) {
    await redisSet(
      getAuthorityKey(
        session.authority,
      ),
      sessionId,
      PAYMENT_TTL_SECONDS,
    );
  }
}

/* =========================================================
   Fail Payment
   ========================================================= */

export async function failPaymentSession(
  sessionId: string,
): Promise<void> {
  if (!sessionId) {
    return;
  }

  const session =
    await getPaymentSession(
      sessionId,
    );

  if (!session) {
    return;
  }

  /*
   * اگر قبلاً completed شده،
   * دیگر نباید آن را failed کنیم.
   */
  if (
    session.status ===
    'completed'
  ) {
    return;
  }

  session.status =
    'failed';

  await redisSet(
    getSessionKey(
      sessionId,
    ),
    JSON.stringify(session),
    PAYMENT_TTL_SECONDS,
  );

  /*
   * Mapping Authority نیز حفظ می‌شود
   * تا بتوانیم Session را برای بررسی پیدا کنیم.
   */
  if (session.authority) {
    await redisSet(
      getAuthorityKey(
        session.authority,
      ),
      sessionId,
      PAYMENT_TTL_SECONDS,
    );
  }
}