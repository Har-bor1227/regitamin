import {
  NextResponse,
} from 'next/server';

import {
  verifyOtpAndLogin,
} from '@/lib/actions/auth';

export async function POST(
  request: Request,
) {
  try {
    const body =
      await request.json();

    const result =
      await verifyOtpAndLogin(
        String(
          body.phone || '',
        ),
        String(
          body.otp || '',
        ),
      );

    return NextResponse.json(
      result,
      {
        status: result.success
          ? 200
          : 401,
      },
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        message:
          'خطای سرور',
      },
      { status: 500 },
    );
  }
}