import { createHash } from 'node:crypto';
import {
  redisGet,
  redisSet,
  redisDelete,
} from '@/lib/redis';

import type { CartItem } from '@/types/cart';

const CART_TTL_SECONDS = 60 * 60 * 24 * 30;

function normalizePhone(phone: string): string {
  return phone
    .replace(/[۰-۹]/g, (digit) =>
      String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)),
    )
    .replace(/[٠-٩]/g, (digit) =>
      String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)),
    )
    .replace(/\D/g, '')
    .trim();
}

function getCartKey(phone: string): string {
  const normalized = normalizePhone(phone);

  const hash = createHash('sha256')
    .update(normalized)
    .digest('hex');

  return `regitamin:cart:${hash}`;
}

export async function getServerCart(
  phone: string,
): Promise<CartItem[]> {
  const key = getCartKey(phone);

  const data = await redisGet<string>(key);

  if (!data) {
    return [];
  }

  try {
    const parsed = JSON.parse(data);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function setServerCart(
  phone: string,
  items: CartItem[],
): Promise<void> {
  const key = getCartKey(phone);

  await redisSet(
    key,
    JSON.stringify(items),
    CART_TTL_SECONDS,
  );
}

export async function clearServerCart(
  phone: string,
): Promise<void> {
  const key = getCartKey(phone);

  await redisDelete(key);
}