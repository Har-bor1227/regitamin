import {
  NextResponse,
} from 'next/server';

import {
  sendOtpAction,
} from '@/lib/actions/auth';

export async function POST(
  request: Request,
) {
  try {
    const body =
      await request.json();

    const result =
      await sendOtpAction(
        String(
          body.phone || '',
        ),
      );

    return NextResponse.json(
      result,
      {
        status: result.success
          ? 200
          : 400,
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