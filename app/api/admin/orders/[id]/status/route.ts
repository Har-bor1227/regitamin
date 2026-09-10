import {
  NextResponse,
} from 'next/server';

import {
  requireAdmin,
} from '@/lib/admin-auth';

import {
  getAdminOrder,
  updateDeliveryStatus,
  type DeliveryStatus,
} from '@/lib/admin-orders';

const ALLOWED_STATUSES:
  DeliveryStatus[] = [
    'pending',
    'preparing',
    'ready',
    'delivered',
  ];

export async function PATCH(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  try {
    await requireAdmin();

    const { id } =
      await params;

    const orderId =
      Number(id);

    if (
      !Number.isInteger(orderId) ||
      orderId <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            'شناسه سفارش نامعتبر است.',
        },
        { status: 400 },
      );
    }

    const body =
      await request.json();

    const status =
      body?.status as
        | DeliveryStatus
        | undefined;

    if (
      !status ||
      !ALLOWED_STATUSES.includes(
        status,
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            'وضعیت تحویل نامعتبر است.',
        },
        { status: 400 },
      );
    }

    const order =
      await updateDeliveryStatus(
        orderId,
        status,
      );

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error(
      'Admin delivery status error:',
      error,
    );

    if (
      error instanceof Error &&
      error.message ===
        'ADMIN_UNAUTHORIZED'
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            'دسترسی غیرمجاز است.',
        },
        { status: 401 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          'تغییر وضعیت سفارش انجام نشد.',
      },
      { status: 500 },
    );
  }
}