import { NextResponse } from 'next/server';

import {
  ADMIN_COOKIE_NAME,
  createAdminToken,
} from '@/lib/admin-auth';

const ADMIN_PANEL_PASSWORD =
  process.env.ADMIN_PANEL_PASSWORD || '';

export async function POST(
  request: Request,
) {
  try {
    if (!ADMIN_PANEL_PASSWORD) {
      return NextResponse.json(
        {
          success: false,
          message:
            'رمز پنل ادمین تنظیم نشده است.',
        },
        { status: 500 },
      );
    }

    const body =
      await request.json();

    const password =
      typeof body?.password === 'string'
        ? body.password
        : '';

    if (!password) {
      return NextResponse.json(
        {
          success: false,
          message:
            'رمز عبور را وارد کنید.',
        },
        { status: 400 },
      );
    }

    if (
      password !== ADMIN_PANEL_PASSWORD
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            'رمز عبور اشتباه است.',
        },
        { status: 401 },
      );
    }

    const token =
      await createAdminToken();

    const response =
      NextResponse.json({
        success: true,
      });

    response.cookies.set(
      ADMIN_COOKIE_NAME,
      token,
      {
        httpOnly: true,
        secure:
          process.env.NODE_ENV ===
          'production',
        sameSite: 'lax',
        maxAge:
          60 * 60 * 24 * 7,
        path: '/',
      },
    );

    return response;
  } catch (error) {
    console.error(
      'Admin login error:',
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          'خطایی هنگام ورود رخ داد.',
      },
      { status: 500 },
    );
  }
}