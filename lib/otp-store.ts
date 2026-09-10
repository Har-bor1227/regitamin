// lib/otp-store.ts

import {
  createHash,
  randomInt,
} from 'node:crypto';

import {
  redisHashSet,
  redisEval,
} from '@/lib/redis';

const OTP_TTL_SECONDS = 120;
const OTP_MAX_ATTEMPTS = 5;

function normalizePhone(
  phone: string,
) {
  return phone.replace(/\D/g, '');
}

function getOtpKey(
  phone: string,
) {
  const normalized =
    normalizePhone(phone);

  const phoneHash =
    createHash('sha256')
      .update(normalized)
      .digest('hex');

  return `regitamin:otp:${phoneHash}`;
}

function hashOtp(
  otp: string,
) {
  return createHash('sha256')
    .update(otp)
    .digest('hex');
}

export async function generateAndStoreOtp(
  phone: string,
) {
  const code =
    randomInt(
      10000,
      100000,
    ).toString();

  const key =
    getOtpKey(phone);

  await redisHashSet(
    key,
    {
      codeHash: hashOtp(code),
      expiresAt: String(
        Date.now() +
          OTP_TTL_SECONDS *
            1000,
      ),
      attempts: '0',
    },
    OTP_TTL_SECONDS,
  );

  return code;
}

export async function verifyAndConsumeOtp(
  phone: string,
  otp: string,
) {
  const key =
    getOtpKey(phone);

  const hashedOtp =
    hashOtp(otp);

  const script = `
    local codeHash = redis.call("HGET", KEYS[1], "codeHash")
    local expiresAt = redis.call("HGET", KEYS[1], "expiresAt")
    local attempts = redis.call("HGET", KEYS[1], "attempts")

    if not codeHash or not expiresAt then
      return 0
    end

    if tonumber(expiresAt) < tonumber(ARGV[2]) then
      redis.call("DEL", KEYS[1])
      return 0
    end

    if tonumber(attempts or "0") >= tonumber(ARGV[3]) then
      redis.call("DEL", KEYS[1])
      return 0
    end

    if codeHash ~= ARGV[1] then
      redis.call("HINCRBY", KEYS[1], "attempts", 1)
      return 0
    end

    redis.call("DEL", KEYS[1])
    return 1
  `;

  const result =
    await redisEval<number>(
      script,
      [key],
      [
        hashedOtp,
        String(Date.now()),
        String(
          OTP_MAX_ATTEMPTS,
        ),
      ],
    );

  return result === 1;
}