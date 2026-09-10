import { createHash, randomUUID } from 'node:crypto';

import {
  redisDelete,
  redisGet,
  redisSet,
} from '@/lib/redis';

import type {
  DietQuestionnaireAnswers,
  DietQuestionnaireSession,
} from '@/types/diet-questionnaire';

import {
  DIET_QUESTIONNAIRE_VERSION,
} from '@/constants/diet-questionnaire';

const QUESTIONNAIRE_TTL_SECONDS =
  60 * 60 * 24;

function normalizePhone(
  phone: string,
): string {
  return phone
    .replace(/[۰-۹]/g, (digit) =>
      String(
        '۰۱۲۳۴۵۶۷۸۹'.indexOf(digit),
      ),
    )
    .replace(/[٠-٩]/g, (digit) =>
      String(
        '٠١٢٣٤٥٦٧٨٩'.indexOf(digit),
      ),
    )
    .replace(/\D/g, '')
    .trim();
}

function getQuestionnaireKey(
  phone: string,
  sessionId: string,
): string {
  const normalizedPhone =
    normalizePhone(phone);

  const phoneHash = createHash('sha256')
    .update(normalizedPhone)
    .digest('hex');

  return `regitamin:questionnaire:${phoneHash}:${sessionId}`;
}

function assertSessionId(
  sessionId: string,
): void {
  if (
    !sessionId ||
    sessionId.length > 100
  ) {
    throw new Error(
      'Invalid questionnaire session.',
    );
  }
}

function sanitizeAnswers(
  answers: DietQuestionnaireAnswers,
): DietQuestionnaireAnswers {
  const result: DietQuestionnaireAnswers =
    {};

  for (const [key, value] of Object.entries(
    answers,
  )) {
    if (
      typeof value === 'string'
    ) {
      result[
        key as keyof DietQuestionnaireAnswers
      ] = value.trim();
      continue;
    }

    if (
      typeof value === 'number' &&
      Number.isFinite(value)
    ) {
      result[
        key as keyof DietQuestionnaireAnswers
      ] = value;
      continue;
    }

    if (Array.isArray(value)) {
      result[
        key as keyof DietQuestionnaireAnswers
      ] = value
        .filter(
          (item): item is string =>
            typeof item === 'string',
        )
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, 30);
    }
  }

  return result;
}

export async function createDietQuestionnaire(
  input: {
    phone: string;
    customerId?: number;
  },
): Promise<DietQuestionnaireSession> {
  const normalizedPhone =
    normalizePhone(input.phone);

  if (!/^09\d{9}$/.test(normalizedPhone)) {
    throw new Error(
      'Invalid authenticated phone number.',
    );
  }

  const now = Date.now();

  const session: DietQuestionnaireSession =
    {
      id: randomUUID(),

      phone: normalizedPhone,

      customerId:
        typeof input.customerId ===
          'number' &&
        input.customerId > 0
          ? input.customerId
          : undefined,

      status: 'draft',

      currentStep: 0,

      answers: {},

      version:
        DIET_QUESTIONNAIRE_VERSION,

      createdAt: now,

      updatedAt: now,
    };

  await redisSet(
    getQuestionnaireKey(
      normalizedPhone,
      session.id,
    ),
    JSON.stringify(session),
    QUESTIONNAIRE_TTL_SECONDS,
  );

  return session;
}

export async function getDietQuestionnaire(
  input: {
    phone: string;
    sessionId: string;
  },
): Promise<DietQuestionnaireSession | null> {
  const normalizedPhone =
    normalizePhone(input.phone);

  assertSessionId(
    input.sessionId,
  );

  const raw =
    await redisGet<string>(
      getQuestionnaireKey(
        normalizedPhone,
        input.sessionId,
      ),
    );

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      raw,
    ) as DietQuestionnaireSession;

    if (
      !parsed ||
      typeof parsed !== 'object'
    ) {
      return null;
    }

    if (
      parsed.phone !==
      normalizedPhone
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export async function updateDietQuestionnaire(
  input: {
    phone: string;
    sessionId: string;
    answers: DietQuestionnaireAnswers;
    currentStep?: number;
  },
): Promise<DietQuestionnaireSession> {
  const session =
    await getDietQuestionnaire({
      phone: input.phone,
      sessionId: input.sessionId,
    });

  if (!session) {
    throw new Error(
      'Questionnaire session not found.',
    );
  }

  if (
    session.status === 'completed'
  ) {
    throw new Error(
      'Questionnaire is already completed.',
    );
  }

  const normalizedAnswers =
    sanitizeAnswers(
      input.answers,
    );

  session.answers = {
    ...session.answers,
    ...normalizedAnswers,
  };

  if (
    input.currentStep !==
      undefined &&
    Number.isInteger(
      input.currentStep,
    )
  ) {
    session.currentStep =
      Math.max(
        0,
        input.currentStep,
      );
  }

  session.updatedAt =
    Date.now();

  await redisSet(
    getQuestionnaireKey(
      session.phone,
      session.id,
    ),
    JSON.stringify(session),
    QUESTIONNAIRE_TTL_SECONDS,
  );

  return session;
}

export async function completeDietQuestionnaire(
  input: {
    phone: string;
    sessionId: string;
    answers?: DietQuestionnaireAnswers;
  },
): Promise<DietQuestionnaireSession> {
  const session =
    await getDietQuestionnaire({
      phone: input.phone,
      sessionId: input.sessionId,
    });

  if (!session) {
    throw new Error(
      'Questionnaire session not found.',
    );
  }

  if (
    input.answers
  ) {
    session.answers = {
      ...session.answers,
      ...sanitizeAnswers(
        input.answers,
      ),
    };
  }

  session.status =
    'completed';

  session.currentStep = 0;

  session.completedAt =
    Date.now();

  session.updatedAt =
    Date.now();

  await redisSet(
    getQuestionnaireKey(
      session.phone,
      session.id,
    ),
    JSON.stringify(session),
    QUESTIONNAIRE_TTL_SECONDS,
  );

  return session;
}

export async function deleteDietQuestionnaire(
  input: {
    phone: string;
    sessionId: string;
  },
): Promise<void> {
  const normalizedPhone =
    normalizePhone(input.phone);

  assertSessionId(
    input.sessionId,
  );

  await redisDelete(
    getQuestionnaireKey(
      normalizedPhone,
      input.sessionId,
    ),
  );
}