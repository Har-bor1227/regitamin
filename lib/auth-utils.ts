// lib/auth-utils.ts

import { jwtVerify } from 'jose';

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

export interface AuthTokenPayload {
  phone: string;
  customerId?: number;
  iat?: number;
  exp?: number;
}

export async function verifyToken(
  token: string,
): Promise<AuthTokenPayload | null> {
  try {
    const {
      payload,
    } =
      await jwtVerify(
        token,
        JWT_SECRET,
        {
          algorithms: [
            'HS256',
          ],
        },
      );

    if (
      typeof payload.phone !==
      'string'
    ) {
      return null;
    }

    return {
      phone:
        payload.phone,
      customerId:
        typeof payload.customerId ===
        'number'
          ? payload.customerId
          : undefined,
      iat:
        typeof payload.iat ===
        'number'
          ? payload.iat
          : undefined,
      exp:
        typeof payload.exp ===
        'number'
          ? payload.exp
          : undefined,
    };
  } catch {
    return null;
  }
}