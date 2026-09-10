'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  Loader2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

import { useRouter } from 'next/navigation';

import { DIET_QUESTIONNAIRE_QUESTIONS } from '@/constants/diet-questionnaire';

import type {
  DietQuestion,
  DietQuestionId,
  DietQuestionnaireAnswers,
  DietQuestionnaireValue,
} from '@/types/diet-questionnaire';

import { useAuth } from '@/providers/auth-provider';

import QuestionProgress from '@/components/questionnaire/question-progress';
import QuestionCard from '@/components/questionnaire/question-card';

const SESSION_STORAGE_KEY = 'regitamin_questionnaire_session';

function isVisibleQuestion(
  question: DietQuestion,
  answers: DietQuestionnaireAnswers,
) {
  if (!question.showWhen) return true;

  const value = answers[question.showWhen.questionId];

  if (Array.isArray(value)) {
    return question.showWhen.values.some((item) =>
      value.includes(item),
    );
  }

  return (
    typeof value === 'string' &&
    question.showWhen.values.includes(value)
  );
}

function hasMeaningfulValue(
  value: DietQuestionnaireValue | undefined,
) {
  if (value === undefined || value === null) return false;

  if (typeof value === 'string') {
    return value.trim().length > 0;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value);
  }

  return Array.isArray(value) && value.length > 0;
}

function validateQuestion(
  question: DietQuestion,
  value: DietQuestionnaireValue | undefined,
) {
  if (!question.required && !hasMeaningfulValue(value)) {
    return '';
  }

  if (question.required && !hasMeaningfulValue(value)) {
    return 'لطفاً این سؤال را پاسخ بده.';
  }

  if (question.type === 'number') {
    const numericValue = Number(value);

    if (!Number.isFinite(numericValue)) {
      return 'لطفاً یک عدد معتبر وارد کن.';
    }

    if (
      question.min !== undefined &&
      numericValue < question.min
    ) {
      return `مقدار باید حداقل ${question.min.toLocaleString(
        'fa-IR',
      )} باشد.`;
    }

    if (
      question.max !== undefined &&
      numericValue > question.max
    ) {
      return `مقدار باید حداکثر ${question.max.toLocaleString(
        'fa-IR',
      )} باشد.`;
    }
  }

  if (
    question.type === 'text' &&
    typeof value === 'string' &&
    question.maxLength &&
    value.length > question.maxLength
  ) {
    return `حداکثر ${question.maxLength.toLocaleString(
      'fa-IR',
    )} کاراکتر مجاز است.`;
  }

  if (
    question.type === 'multi' &&
    Array.isArray(value) &&
    value.includes('none') &&
    value.length > 1
  ) {
    return 'اگر «ندارم» را انتخاب کردی، گزینه دیگری را همزمان انتخاب نکن.';
  }

  return '';
}

function getStoredSessionId() {
  try {
    return localStorage.getItem(SESSION_STORAGE_KEY);
  } catch {
    return null;
  }
}

function storeSessionId(sessionId: string) {
  try {
    localStorage.setItem(
      SESSION_STORAGE_KEY,
      sessionId,
    );
  } catch {}
}

function clearStoredSessionId() {
  try {
    localStorage.removeItem(
      SESSION_STORAGE_KEY,
    );
  } catch {}
}

export default function QuestionnairePageContent() {
  const router = useRouter();

  const {
    isLoggedIn,
    loading: authLoading,
  } = useAuth();

  const [sessionId, setSessionId] =
    useState<string | null>(null);

  const [answers, setAnswers] =
    useState<DietQuestionnaireAnswers>({});

  const [step, setStep] = useState(0);

  const [initializing, setInitializing] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [isNavigating, setIsNavigating] =
    useState(false);

  const [error, setError] =
    useState('');

  const [direction, setDirection] =
    useState<'forward' | 'backward'>(
      'forward',
    );

  const [transitionKey, setTransitionKey] =
    useState(0);

  const autoAdvanceTimer = useRef<
    number | null
  >(null);

  const saveTimer = useRef<
    number | null
  >(null);

  const busyRef =
    useRef(false);

  /**
   * تمام ذخیره‌ها به‌صورت زنجیره‌ای اجرا می‌شوند.
   *
   * این باعث می‌شود یک autosave قدیمی نتواند
   * بعد از save جدید، state جدید را overwrite کند.
   */
  const saveQueueRef = useRef<
    Promise<boolean>
  >(Promise.resolve(true));

  const visibleQuestions = useMemo(
    () =>
      DIET_QUESTIONNAIRE_QUESTIONS.filter(
        (question) =>
          isVisibleQuestion(
            question,
            answers,
          ),
      ),
    [answers],
  );

  const currentQuestion =
    visibleQuestions[step] ?? null;

  const currentAnswer =
    currentQuestion
      ? answers[currentQuestion.id]
      : undefined;

  const isLastStep =
    visibleQuestions.length > 0 &&
    step === visibleQuestions.length - 1;

  const progressStep =
    Math.min(
      visibleQuestions.length,
      step + 1,
    );

  const clearTimers = useCallback(() => {
    if (autoAdvanceTimer.current) {
      window.clearTimeout(
        autoAdvanceTimer.current,
      );

      autoAdvanceTimer.current = null;
    }

    if (saveTimer.current) {
      window.clearTimeout(
        saveTimer.current,
      );

      saveTimer.current = null;
    }
  }, []);

  useEffect(() => {
    return clearTimers;
  }, [clearTimers]);

  const createOrRestoreSession =
    useCallback(async () => {
      try {
        setInitializing(true);
        setError('');

        const storedSessionId =
          getStoredSessionId();

        if (storedSessionId) {
          const response = await fetch(
            `/api/questionnaire?sessionId=${encodeURIComponent(
              storedSessionId,
            )}`,
            {
              credentials: 'include',
              cache: 'no-store',
            },
          );

          if (response.ok) {
            const data =
              await response.json();

            const questionnaire =
              data.questionnaire;

            setSessionId(
              questionnaire.id,
            );

            storeSessionId(
              questionnaire.id,
            );

            setAnswers(
              questionnaire.answers || {},
            );

            const storedStep =
              Number.isInteger(
                questionnaire.currentStep,
              )
                ? questionnaire.currentStep
                : 0;

            setStep(
              Math.max(
                0,
                storedStep,
              ),
            );

            return;
          }

          clearStoredSessionId();
        }

        const response =
          await fetch(
            '/api/questionnaire',
            {
              method: 'POST',
              headers: {
                'Content-Type':
                  'application/json',
              },
              credentials: 'include',
              cache: 'no-store',
              body: JSON.stringify({
                action: 'create',
              }),
            },
          );

        const data =
          await response.json();

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.error ||
              'ساخت فرم انجام نشد.',
          );
        }

        const questionnaire =
          data.questionnaire;

        setSessionId(
          questionnaire.id,
        );

        storeSessionId(
          questionnaire.id,
        );

        setAnswers(
          questionnaire.answers || {},
        );

        setStep(0);
      } catch (err) {
        console.error(
          'Questionnaire initialization error:',
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : 'خطایی هنگام آماده‌سازی فرم رخ داد.',
        );
      } finally {
        setInitializing(false);
      }
    }, []);

  useEffect(() => {
    if (authLoading) return;

    if (!isLoggedIn) {
      router.replace(
        '/auth/login?redirect=/checkout/questionnaire',
      );

      return;
    }

    createOrRestoreSession();
  }, [
    authLoading,
    isLoggedIn,
    router,
    createOrRestoreSession,
  ]);

  useEffect(() => {
    if (
      visibleQuestions.length === 0
    ) {
      setStep(0);
      return;
    }

    if (
      step >=
      visibleQuestions.length
    ) {
      setStep(
        visibleQuestions.length - 1,
      );
    }
  }, [
    step,
    visibleQuestions.length,
  ]);

  /**
   * ذخیره واقعی.
   *
   * درخواست‌ها صف می‌شوند تا ترتیب ذخیره‌ها
   * همیشه حفظ شود.
   */
  const saveCurrentState =
    useCallback(
      async (
        nextAnswers: DietQuestionnaireAnswers,
        nextStep: number,
      ) => {
        if (!sessionId) {
          return false;
        }

        const runSave =
          async (): Promise<boolean> => {
            try {
              setSaving(true);

              const response =
                await fetch(
                  '/api/questionnaire',
                  {
                    method: 'POST',
                    headers: {
                      'Content-Type':
                        'application/json',
                    },
                    credentials:
                      'include',
                    cache: 'no-store',
                    body: JSON.stringify({
                      action: 'save',
                      sessionId,
                      currentStep:
                        nextStep,
                      answers:
                        nextAnswers,
                    }),
                  },
                );

              const data =
                await response.json();

              if (
                !response.ok ||
                !data.success
              ) {
                throw new Error(
                  data.error ||
                    'ذخیره اطلاعات انجام نشد.',
                );
              }

              return true;
            } catch (err) {
              console.error(
                'Questionnaire save error:',
                err,
              );

              setError(
                err instanceof Error
                  ? err.message
                  : 'ذخیره اطلاعات انجام نشد.',
              );

              return false;
            } finally {
              setSaving(false);
            }
          };

        const queuedSave =
          saveQueueRef.current.then(
            runSave,
            runSave,
          );

        saveQueueRef.current =
          queuedSave.catch(
            () => false,
          );

        return queuedSave;
      },
      [sessionId],
    );

  const scheduleAutosave =
    useCallback(
      (
        nextAnswers: DietQuestionnaireAnswers,
        nextStep: number,
      ) => {
        if (saveTimer.current) {
          window.clearTimeout(
            saveTimer.current,
          );
        }

        saveTimer.current =
          window.setTimeout(() => {
            saveTimer.current = null;

            void saveCurrentState(
              nextAnswers,
              nextStep,
            );
          }, 450);
      },
      [saveCurrentState],
    );

  const handleAnswerChange =
    useCallback(
      (
        questionId: DietQuestionId,
        value: DietQuestionnaireValue,
      ) => {
        setError('');

        setAnswers((previous) => {
          const next = {
            ...previous,
            [questionId]: value,
          };

          scheduleAutosave(
            next,
            step,
          );

          return next;
        });
      },
      [
        scheduleAutosave,
        step,
      ],
    );

  const goToStep =
    useCallback(
      (
        nextStep: number,
        nextDirection:
          | 'forward'
          | 'backward',
      ) => {
        setDirection(
          nextDirection,
        );

        setTransitionKey(
          (current) =>
            current + 1,
        );

        setStep(
          Math.max(
            0,
            Math.min(
              nextStep,
              visibleQuestions.length -
                1,
            ),
          ),
        );
      },
      [visibleQuestions.length],
    );

  const handleNext =
    useCallback(async () => {
      if (
        !currentQuestion ||
        busyRef.current
      ) {
        return;
      }

      const validationError =
        validateQuestion(
          currentQuestion,
          currentAnswer,
        );

      if (validationError) {
        setError(
          validationError,
        );

        return;
      }

      setError('');

      busyRef.current = true;
      setIsNavigating(true);

      /**
       * autosave زمان‌دار را قبل از save دستی
       * لغو می‌کنیم تا step قدیمی بعداً ارسال نشود.
       */
      if (saveTimer.current) {
        window.clearTimeout(
          saveTimer.current,
        );

        saveTimer.current = null;
      }

      try {
        const nextStep =
          step + 1;

        if (
          nextStep <
          visibleQuestions.length
        ) {
          const saved =
            await saveCurrentState(
              answers,
              nextStep,
            );

          if (!saved) {
            return;
          }

          goToStep(
            nextStep,
            'forward',
          );

          return;
        }

        /**
         * قبل از تکمیل، اجازه می‌دهیم
         * هر save قبلی که در صف مانده تمام شود.
         */
        await saveQueueRef.current;

        const response =
          await fetch(
            '/api/questionnaire',
            {
              method: 'POST',
              headers: {
                'Content-Type':
                  'application/json',
              },
              credentials: 'include',
              cache: 'no-store',
              body: JSON.stringify({
                action: 'complete',
                sessionId,
                answers,
              }),
            },
          );

        const data =
          await response.json();

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.error ||
              'تکمیل فرم انجام نشد.',
          );
        }

        clearStoredSessionId();

        router.push(
          `/checkout?questionnaire=${encodeURIComponent(
            sessionId || '',
          )}`,
        );
      } catch (err) {
        console.error(
          'Questionnaire next error:',
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : 'خطایی هنگام ادامه سفارش رخ داد.',
        );
      } finally {
        busyRef.current = false;
        setIsNavigating(false);
      }
    }, [
      answers,
      clearStoredSessionId,
      currentAnswer,
      currentQuestion,
      goToStep,
      router,
      saveCurrentState,
      sessionId,
      step,
      visibleQuestions.length,
    ]);

  const handleBack =
    useCallback(() => {
      if (
        busyRef.current ||
        step <= 0
      ) {
        return;
      }

      setError('');

      /**
       * save تایمری که ممکن است مربوط به step قبلی باشد
       * لغو می‌شود.
       */
      if (saveTimer.current) {
        window.clearTimeout(
          saveTimer.current,
        );

        saveTimer.current = null;
      }

      const previousStep =
        step - 1;

      goToStep(
        previousStep,
        'backward',
      );

      /**
       * ذخیره step جدید بدون blocking کردن UI.
       */
      void saveCurrentState(
        answers,
        previousStep,
      );
    }, [
      answers,
      goToStep,
      saveCurrentState,
      step,
    ]);

  useEffect(() => {
    if (
      !currentQuestion ||
      currentQuestion.type !==
        'single' ||
      !hasMeaningfulValue(
        currentAnswer,
      ) ||
      isNavigating
    ) {
      return;
    }

    if (autoAdvanceTimer.current) {
      window.clearTimeout(
        autoAdvanceTimer.current,
      );
    }

    autoAdvanceTimer.current =
      window.setTimeout(() => {
        autoAdvanceTimer.current =
          null;

        void handleNext();
      }, 240);

    return () => {
      if (autoAdvanceTimer.current) {
        window.clearTimeout(
          autoAdvanceTimer.current,
        );

        autoAdvanceTimer.current =
          null;
      }
    };
  }, [
    currentAnswer,
    currentQuestion,
    handleNext,
    isNavigating,
  ]);

  if (
    authLoading ||
    initializing
  ) {
    return (
      <main className="min-h-[100svh] bg-[#FCFDFC]">
        <div className="flex min-h-[100svh] items-center justify-center px-5">
          <div className="w-full max-w-sm rounded-[28px] border border-slate-200/80 bg-white p-7 text-center shadow-[0_18px_55px_rgba(30,35,25,.06)]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--brand-orange)]/10 text-[var(--brand-orange-dark)]">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>

            <h1 className="mt-5 text-lg font-black text-slate-900">
              در حال آماده‌سازی فرم
            </h1>

            <p className="mt-2 text-xs leading-6 text-muted-foreground">
              اطلاعاتت امن ذخیره می‌شه و بعداً به سفارش متصل خواهد شد.
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!currentQuestion) {
    return (
      <main className="min-h-[100svh] bg-[#FCFDFC]">
        <div className="flex min-h-[100svh] items-center justify-center px-5">
          <div className="w-full max-w-md rounded-[28px] border border-slate-200/80 bg-white p-7 text-center shadow-[0_18px_55px_rgba(30,35,25,.06)]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-lg font-black text-red-500">
              !
            </div>

            <h1 className="mt-5 text-xl font-black text-slate-900">
              فرم قابل نمایش نیست
            </h1>

            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              {error ||
                'لطفاً دوباره تلاش کنید.'}
            </p>

            <button
              type="button"
              onClick={() =>
                window.location.reload()
              }
              className="mt-6 h-12 rounded-2xl bg-[var(--brand-orange-dark)] px-6 text-sm font-black text-white"
            >
              تلاش مجدد
            </button>
          </div>
        </div>
      </main>
    );
  }

  const isMultiple =
    currentQuestion.type ===
    'multi';

  return (
    <main className="min-h-[100svh] bg-[#FCFDFC]">
      <div className="mx-auto flex min-h-[100svh] w-full max-w-5xl flex-col">
        {/* Top */}
        <header className="sticky top-0 z-30 border-b border-black/[0.04] bg-[#FCFDFC]/95 px-4 py-3.5 backdrop-blur-xl sm:px-6 md:px-8">
          <div className="mx-auto w-full max-w-3xl">
            <div className="mb-3.5 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() =>
                  router.push('/cart')
                }
                disabled={isNavigating}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm ring-1 ring-black/[0.04] transition hover:text-slate-900 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
                aria-label="بازگشت به سبد خرید"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--brand-orange)]/10 text-[var(--brand-orange-dark)]">
                  <Sparkles className="h-4 w-4" />
                </div>

                <span className="text-xs font-black text-slate-900">
                  رژیم شخصی تو
                </span>
              </div>

              <div className="w-10" />
            </div>

            <QuestionProgress
              current={progressStep}
              total={visibleQuestions.length}
            />
          </div>
        </header>

        {/* Content */}
        <div className="flex flex-1 flex-col px-4 pb-[145px] pt-6 sm:px-6 sm:pt-10 md:px-8 md:pb-10">
          <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col">
            <div
              key={transitionKey}
              className={[
                'flex-1',
                direction === 'forward'
                  ? 'animate-[questionIn_280ms_ease-out]'
                  : 'animate-[questionBackIn_280ms_ease-out]',
              ].join(' ')}
            >
              <QuestionCard
                question={currentQuestion}
                value={currentAnswer}
                error={error}
                disabled={isNavigating}
                onChange={(value) =>
                  handleAnswerChange(
                    currentQuestion.id,
                    value,
                  )
                }
                onSubmit={handleNext}
              />

              {isMultiple && (
                <p className="mt-4 text-[11px] font-medium leading-6 text-muted-foreground">
                  می‌تونی چند گزینه رو همزمان انتخاب کنی.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Desktop actions */}
        <div className="hidden border-t border-black/[0.04] px-6 py-5 md:block md:px-8">
          <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4">
            <button
              type="button"
              disabled={
                step === 0 ||
                isNavigating
              }
              onClick={handleBack}
              className="flex h-12 items-center gap-2 rounded-2xl px-4 text-sm font-bold text-slate-500 transition hover:bg-white hover:text-slate-900 disabled:pointer-events-none disabled:opacity-30"
            >
              <ArrowRight className="h-4 w-4" />
              بازگشت
            </button>

            <div className="flex items-center gap-2 text-[10px] font-medium text-muted-foreground">
              {saving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  در حال ذخیره در پس‌زمینه
                </>
              ) : (
                <>
                  <ShieldCheck className="h-3.5 w-3.5 text-[var(--brand-orange-dark)]" />
                  ذخیره خودکار فعال است
                </>
              )}
            </div>

            {currentQuestion.type ===
            'single' ? (
              <div className="flex h-12 min-w-[150px] items-center justify-center gap-2 rounded-2xl bg-[var(--brand-orange-dark)] px-6 text-sm font-black text-white">
                {isNavigating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    در حال ادامه
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    انتخاب شد
                  </>
                )}
              </div>
            ) : (
              <button
                type="button"
                disabled={isNavigating}
                onClick={handleNext}
                className="flex h-12 min-w-[150px] items-center justify-center gap-2 rounded-2xl bg-[var(--brand-orange-dark)] px-6 text-sm font-black text-white shadow-[0_10px_24px_rgba(225,76,43,.14)] transition hover:-translate-y-0.5 hover:bg-[#d94324] disabled:pointer-events-none disabled:opacity-60"
              >
                {isNavigating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    در حال ادامه
                  </>
                ) : isLastStep ? (
                  <>
                    تکمیل اطلاعات
                    <ArrowLeft className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    ادامه
                    <ArrowLeft className="h-4 w-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Mobile actions */}
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-black/[0.05] bg-white/95 px-4 pb-[max(14px,env(safe-area-inset-bottom))] pt-3 shadow-[0_-10px_40px_rgba(20,40,30,.08)] backdrop-blur-xl md:hidden">
          <div className="mx-auto flex w-full max-w-3xl items-center gap-2">
            <button
              type="button"
              disabled={
                step === 0 ||
                isNavigating
              }
              onClick={handleBack}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition active:scale-95 disabled:pointer-events-none disabled:opacity-30"
              aria-label="سؤال قبلی"
            >
              <ArrowRight className="h-5 w-5" />
            </button>

            {currentQuestion.type ===
            'single' ? (
              <div className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-[var(--brand-orange-dark)] text-sm font-black text-white shadow-[0_10px_22px_rgba(225,76,43,.14)]">
                {isNavigating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    در حال ادامه
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    انتخاب شد
                  </>
                )}
              </div>
            ) : (
              <button
                type="button"
                disabled={isNavigating}
                onClick={handleNext}
                className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-[var(--brand-orange-dark)] text-sm font-black text-white shadow-[0_10px_22px_rgba(225,76,43,.14)] transition active:scale-[.99] disabled:pointer-events-none disabled:opacity-60"
              >
                {isNavigating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    در حال ادامه
                  </>
                ) : isLastStep ? (
                  <>
                    تکمیل اطلاعات
                    <Check className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    ادامه
                    <ArrowLeft className="h-4 w-4" />
                  </>
                )}
              </button>
            )}
          </div>

          <div className="mx-auto mt-2 flex max-w-3xl items-center justify-center gap-1.5">
            {saving ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin text-[var(--brand-orange-dark)]" />
                <span className="text-[9px] font-medium text-muted-foreground">
                  ذخیره در پس‌زمینه...
                </span>
              </>
            ) : (
              <>
                <ShieldCheck className="h-3 w-3 text-[var(--brand-orange-dark)]" />
                <span className="text-[9px] font-medium text-muted-foreground">
                  پاسخ‌ها به‌صورت خودکار ذخیره می‌شوند
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes questionIn {
          from {
            opacity: 0;
            transform: translateX(18px);
          }

          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes questionBackIn {
          from {
            opacity: 0;
            transform: translateX(-18px);
          }

          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </main>
  );
}