// lib/rate-limiter.ts

import { redisEval } from '@/lib/redis';

const WINDOW_SECONDS =
  5 * 60;

const MAX_REQUESTS = 3;

export async function checkRateLimit(
  key: string,
): Promise<boolean> {
  const script = `
    local current = redis.call("INCR", KEYS[1])

    if current == 1 then
      redis.call("EXPIRE", KEYS[1], ARGV[1])
    end

    return current
  `;

  const count =
    await redisEval<number>(
      script,
      [key],
      [String(WINDOW_SECONDS)],
    );

  return (
    Number(count) <=
    MAX_REQUESTS
  );
}

export async function getRateLimitState(
  key: string,
) {
  const script = `
    local current = redis.call("GET", KEYS[1])

    if not current then
      return 0
    end

    return tonumber(current)
  `;

  const count =
    await redisEval<number>(
      script,
      [key],
      [],
    );

  const numericCount =
    Number(count || 0);

  return {
    limit: MAX_REQUESTS,
    remaining: Math.max(
      0,
      MAX_REQUESTS -
        numericCount,
    ),
  };
}