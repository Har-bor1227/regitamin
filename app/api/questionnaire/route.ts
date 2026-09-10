import { NextResponse } from 'next/server';

import { cookies } from 'next/headers';

import {
  verifyToken,
} from '@/lib/auth-utils';

import {
  createDietQuestionnaire,
  deleteDietQuestionnaire,
  getDietQuestionnaire,
  updateDietQuestionnaire,
  completeDietQuestionnaire,
} from '@/lib/diet-questionnaire-store';

import type {
  DietQuestionnaireAnswers,
} from '@/types/diet-questionnaire';

import {
  DIET_QUESTIONNAIRE_VERSION,
} from '@/constants/diet-questionnaire';

interface RequestBody {
  action?:
    | 'create'
    | 'save'
    | 'complete'
    | 'delete';

  sessionId?: string;

  answers?: DietQuestionnaireAnswers;

  currentStep?: number;
}

async function getAuthenticatedUser() {
  const cookieStore =
    await cookies();

  const token =
    cookieStore.get(
      'auth_token',
    )?.value;

  if (!token) {
    return null;
  }

  const payload =
    await verifyToken(token);

  if (!payload?.phone) {
    return null;
  }

  return {
    phone: payload.phone,

    customerId:
      typeof payload.customerId ===
        'number'
        ? payload.customerId
        : undefined,
  };
}

function jsonError(
  message: string,
  status: number,
) {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    {
      status,
      headers: {
        'Cache-Control':
          'private, no-store, max-age=0',
      },
    },
  );
}

function jsonSuccess(
  data: Record<string, unknown>,
) {
  return NextResponse.json(
    {
      success: true,
      ...data,
    },
    {
      status: 200,
      headers: {
        'Cache-Control':
          'private, no-store, max-age=0',
      },
    },
  );
}

function isValidSessionId(
  value: unknown,
): value is string {
  return (
    typeof value === 'string' &&
    value.length >= 20 &&
    value.length <= 100
  );
}

function isValidAnswers(
  value: unknown,
): value is DietQuestionnaireAnswers {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value)
  );
}

function isValidStep(
  value: unknown,
): value is number {
  return (
    value === undefined ||
    (
      typeof value === 'number' &&
      Number.isInteger(value) &&
      value >= 0 &&
      value <= 100
    )
  );
}

export async function GET(
  request: Request,
) {
  try {
    const user =
      await getAuthenticatedUser();

    if (!user) {
      return jsonError(
        'برای ادامه باید وارد حساب کاربری شوید.',
        401,
      );
    }

    const url =
      new URL(request.url);

    const sessionId =
      url.searchParams.get(
        'sessionId',
      );

    if (
      !isValidSessionId(
        sessionId,
      )
    ) {
      return jsonError(
        'شناسه فرم نامعتبر است.',
        400,
      );
    }

    const session =
      await getDietQuestionnaire({
        phone: user.phone,
        sessionId,
      });

    if (!session) {
      return jsonError(
        'فرم موردنظر پیدا نشد یا منقضی شده است.',
        404,
      );
    }

    return jsonSuccess({
      questionnaire: session,
    });
  } catch (error) {
    console.error(
      'Questionnaire GET error:',
      error,
    );

    return jsonError(
      'خطایی هنگام دریافت اطلاعات فرم رخ داد.',
      500,
    );
  }
}

export async function POST(
  request: Request,
) {
  try {
    const user =
      await getAuthenticatedUser();

    if (!user) {
      return jsonError(
        'برای ادامه باید وارد حساب کاربری شوید.',
        401,
      );
    }

    let body: RequestBody;

    try {
      body =
        (await request.json()) as RequestBody;
    } catch {
      return jsonError(
        'اطلاعات ارسال‌شده نامعتبر است.',
        400,
      );
    }

    const action =
      body.action || 'save';

    if (
      action === 'create'
    ) {
      const questionnaire =
        await createDietQuestionnaire({
          phone: user.phone,
          customerId:
            user.customerId,
        });

      return jsonSuccess({
        questionnaire,
      });
    }

    if (
      !isValidSessionId(
        body.sessionId,
      )
    ) {
      return jsonError(
        'شناسه فرم نامعتبر است.',
        400,
      );
    }

    if (
      body.answers !== undefined &&
      !isValidAnswers(
        body.answers,
      )
    ) {
      return jsonError(
        'ساختار پاسخ‌ها نامعتبر است.',
        400,
      );
    }

    if (
      !isValidStep(
        body.currentStep,
      )
    ) {
      return jsonError(
        'مرحله فرم نامعتبر است.',
        400,
      );
    }

    if (
      action === 'save'
    ) {
      const questionnaire =
        await updateDietQuestionnaire({
          phone: user.phone,
          sessionId:
            body.sessionId,
          answers:
            body.answers || {},
          currentStep:
            body.currentStep,
        });

      return jsonSuccess({
        questionnaire,
      });
    }

    if (
      action === 'complete'
    ) {
      const questionnaire =
        await completeDietQuestionnaire({
          phone: user.phone,
          sessionId:
            body.sessionId,
          answers:
            body.answers,
        });

      return jsonSuccess({
        questionnaire,
        questionnaireVersion:
          DIET_QUESTIONNAIRE_VERSION,
      });
    }

    if (
      action === 'delete'
    ) {
      await deleteDietQuestionnaire({
        phone: user.phone,
        sessionId:
          body.sessionId,
      });

      return jsonSuccess({
        deleted: true,
      });
    }

    return jsonError(
      'عملیات درخواست‌شده پشتیبانی نمی‌شود.',
      400,
    );
  } catch (error) {
    console.error(
      'Questionnaire POST error:',
      error,
    );

    const message =
      error instanceof Error
        ? error.message
        : '';

    if (
      message.includes(
        'already completed',
      )
    ) {
      return jsonError(
        'این فرم قبلاً تکمیل شده است.',
        409,
      );
    }

    if (
      message.includes(
        'not found',
      )
    ) {
      return jsonError(
        'فرم پیدا نشد یا منقضی شده است.',
        404,
      );
    }

    return jsonError(
      'خطایی هنگام ذخیره اطلاعات فرم رخ داد.',
      500,
    );
  }
}