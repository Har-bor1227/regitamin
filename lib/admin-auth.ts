import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';

const ADMIN_JWT_SECRET_VALUE =
  process.env.ADMIN_JWT_SECRET?.trim() || '';

if (
  !ADMIN_JWT_SECRET_VALUE ||
  ADMIN_JWT_SECRET_VALUE.length < 32
) {
  throw new Error(
    'ADMIN_JWT_SECRET must be configured and at least 32 characters long.',
  );
}

const ADMIN_JWT_SECRET = new TextEncoder().encode(
  ADMIN_JWT_SECRET_VALUE,
);

export const ADMIN_COOKIE_NAME = 'regitamin_admin_token';

export interface AdminSession {
  role: 'admin';
  iat?: number;
  exp?: number;
}

export async function createAdminToken() {
  return new SignJWT({ role: 'admin' })
    .setProtectedHeader({
      alg: 'HS256',
      typ: 'JWT',
    })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(ADMIN_JWT_SECRET);
}

export async function verifyAdminToken(
  token: string,
): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(
      token,
      ADMIN_JWT_SECRET,
      {
        algorithms: ['HS256'],
      },
    );

    if (payload.role !== 'admin') return null;

    return {
      role: 'admin',
      iat:
        typeof payload.iat === 'number'
          ? payload.iat
          : undefined,
      exp:
        typeof payload.exp === 'number'
          ? payload.exp
          : undefined,
    };
  } catch {
    return null;
  }
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  return token ? verifyAdminToken(token) : null;
}

export async function isAdmin() {
  const session = await getAdminSession();
  return session?.role === 'admin';
}

export async function requireAdmin() {
  const session = await getAdminSession();

  if (!session || session.role !== 'admin') {
    throw new Error('ADMIN_UNAUTHORIZED');
  }

  return session;
}