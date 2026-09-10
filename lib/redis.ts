// lib/redis.ts

/**
 * =========================================================
 * Upstash Redis REST Client
 * =========================================================
 *
 * ویژگی‌ها:
 * - Timeout کنترل‌شده
 * - Retry برای خطاهای شبکه
 * - Backoff بین تلاش‌ها
 * - مدیریت خطای HTTP
 * - مدیریت خطای Redis
 * - بدون لاگ کردن Token یا اطلاعات حساس
 * - سازگار با Next.js Server Runtime
 */

const REDIS_URL =
  process.env.UPSTASH_REDIS_REST_URL?.trim() || '';

const REDIS_TOKEN =
  process.env.UPSTASH_REDIS_REST_TOKEN?.trim() || '';

/*
 * تعداد تلاش‌های مجدد در خطاهای شبکه.
 *
 * در مجموع حداکثر:
 * 1 درخواست اصلی + 2 retry
 */
const MAX_RETRIES = 2;

/*
 * Timeout هر درخواست Redis.
 *
 * 8 ثانیه مناسب است؛
 * نمی‌خواهیم درخواست‌های سایت برای همیشه معطل بمانند.
 */
const REQUEST_TIMEOUT_MS = 8000;

/*
 * فاصله اولیه قبل از retry.
 */
const RETRY_BASE_DELAY_MS = 250;

/* =========================================================
   Configuration
   ========================================================= */

function assertRedisConfigured() {
  if (!REDIS_URL) {
    throw new Error(
      'UPSTASH_REDIS_REST_URL is not configured.',
    );
  }

  if (!REDIS_TOKEN) {
    throw new Error(
      'UPSTASH_REDIS_REST_TOKEN is not configured.',
    );
  }
}

/* =========================================================
   Retry Helpers
   ========================================================= */

function sleep(
  milliseconds: number,
): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(
      resolve,
      milliseconds,
    );
  });
}

function isRetryableError(
  error: unknown,
): boolean {
  if (
    error instanceof DOMException &&
    error.name === 'AbortError'
  ) {
    return true;
  }

  if (
    error instanceof Error
  ) {
    const message =
      error.message.toLowerCase();

    return (
      message.includes(
        'fetch failed',
      ) ||
      message.includes(
        'timeout',
      ) ||
      message.includes(
        'connect',
      ) ||
      message.includes(
        'socket',
      ) ||
      message.includes(
        'network',
      ) ||
      message.includes(
        'econnreset',
      ) ||
      message.includes(
        'econnrefused',
      )
    );
  }

  return false;
}

/* =========================================================
   Core Redis Request
   ========================================================= */

async function redisCommand<
  T = unknown,
>(
  command: string[],
): Promise<T> {
  assertRedisConfigured();

  let lastError: unknown =
    null;

  for (
    let attempt = 0;
    attempt <= MAX_RETRIES;
    attempt += 1
  ) {
    const controller =
      new AbortController();

    const timeout = setTimeout(
      () => {
        controller.abort();
      },
      REQUEST_TIMEOUT_MS,
    );

    try {
      const response =
        await fetch(
          REDIS_URL,
          {
            method: 'POST',

            headers: {
              Authorization:
                `Bearer ${REDIS_TOKEN}`,

              'Content-Type':
                'application/json',

              Accept:
                'application/json',
            },

            body: JSON.stringify(
              command,
            ),

            cache:
              'no-store',

            signal:
              controller.signal,
          },
        );

      clearTimeout(timeout);

      /*
       * خطای HTTP
       */
      if (!response.ok) {
        const body =
          await response.text();

        /*
         * 429 و 5xx معمولاً موقتی‌اند.
         */
        const retryable =
          response.status ===
            429 ||
          response.status >= 500;

        if (
          retryable &&
          attempt <
            MAX_RETRIES
        ) {
          const delay =
            RETRY_BASE_DELAY_MS *
            2 ** attempt;

          await sleep(delay);

          continue;
        }

        throw new Error(
          `Redis HTTP error: ${response.status} ${body}`,
        );
      }

      const payload =
        await response.json();

      if (
        payload?.error
      ) {
        throw new Error(
          `Redis command error: ${String(
            payload.error,
          )}`,
        );
      }

      return payload.result as T;
    } catch (error) {
      clearTimeout(timeout);

      lastError =
        error;

      /*
       * اگر خطا قابل retry نیست،
       * همان لحظه متوقف شو.
       */
      if (
        !isRetryableError(
          error,
        )
      ) {
        throw error;
      }

      /*
       * اگر retry باقی مانده،
       * exponential backoff
       */
      if (
        attempt <
        MAX_RETRIES
      ) {
        const delay =
          RETRY_BASE_DELAY_MS *
          2 ** attempt;

        await sleep(delay);

        continue;
      }
    }
  }

  /*
   * تمام retryها شکست خورده‌اند.
   */
  if (
    lastError instanceof Error
  ) {
    throw new Error(
      `Redis connection failed after ${MAX_RETRIES + 1} attempts: ${lastError.message}`,
    );
  }

  throw new Error(
    `Redis connection failed after ${MAX_RETRIES + 1} attempts.`,
  );
}

/* =========================================================
   GET
   ========================================================= */

export async function redisGet<
  T = string,
>(
  key: string,
): Promise<T | null> {
  const result =
    await redisCommand<
      string | null
    >([
      'GET',
      key,
    ]);

  if (
    result === null ||
    result === undefined
  ) {
    return null;
  }

  return result as T;
}

/* =========================================================
   SET
   ========================================================= */

export async function redisSet(
  key: string,
  value: string,
  ttlSeconds?: number,
): Promise<
  unknown
> {
  const command =
    ttlSeconds &&
    Number.isFinite(
      ttlSeconds,
    ) &&
    ttlSeconds > 0
      ? [
          'SET',
          key,
          value,
          'EX',
          String(
            Math.floor(
              ttlSeconds,
            ),
          ),
        ]
      : [
          'SET',
          key,
          value,
        ];

  return redisCommand(
    command,
  );
}

/* =========================================================
   DELETE
   ========================================================= */

export async function redisDelete(
  key: string,
): Promise<
  unknown
> {
  return redisCommand([
    'DEL',
    key,
  ]);
}

/* =========================================================
   HASH SET
   ========================================================= */

export async function redisHashSet(
  key: string,
  values: Record<
    string,
    string
  >,
  ttlSeconds?: number,
): Promise<void> {
  const command: string[] = [
    'HSET',
    key,
  ];

  for (
    const [
      field,
      value,
    ] of Object.entries(
      values,
    )
  ) {
    command.push(
      field,
      value,
    );
  }

  await redisCommand(
    command,
  );

  if (
    ttlSeconds &&
    Number.isFinite(
      ttlSeconds,
    ) &&
    ttlSeconds > 0
  ) {
    await redisCommand([
      'EXPIRE',
      key,
      String(
        Math.floor(
          ttlSeconds,
        ),
      ),
    ]);
  }
}

/* =========================================================
   EVAL
   ========================================================= */

export async function redisEval<
  T = unknown,
>(
  script: string,
  keys: string[],
  args: string[],
): Promise<T> {
  const command = [
    'EVAL',
    script,
    String(
      keys.length,
    ),
    ...keys,
    ...args,
  ];

  return redisCommand<T>(
    command,
  );
}