'use client';

import {
  Suspense,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  useRouter,
  useSearchParams,
} from 'next/navigation';

import {
  ArrowLeft,
  Check,
  CircleAlert,
  Loader2,
  ReceiptText,
  ShieldCheck,
  XCircle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useCart } from '@/providers/cart-provider';

type PaymentState =
  | 'loading'
  | 'success'
  | 'error';

const MAX_PROCESSING_ATTEMPTS = 20;
const PROCESSING_RETRY_DELAY = 1500;

function PaymentCard({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative w-full max-w-lg overflow-hidden rounded-[32px] border border-black/[0.06] bg-white shadow-[0_24px_80px_rgba(40,28,16,0.10)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_50%_-20%,rgba(254,132,31,0.13),transparent_68%)]" />

      <div className="relative p-5 sm:p-7 md:p-8">
        {children}
      </div>
    </div>
  );
}

function StatusIcon({
  type,
}: {
  type: 'loading' | 'success' | 'error';
}) {
  if (type === 'success') {
    return (
      <div className="flex h-[76px] w-[76px] items-center justify-center rounded-[26px] bg-primary/10 text-primary shadow-[0_12px_30px_rgba(254,132,31,0.10)]">
        <Check className="h-9 w-9 stroke-[2.5]" />
      </div>
    );
  }

  if (type === 'error') {
    return (
      <div className="flex h-[76px] w-[76px] items-center justify-center rounded-[26px] bg-red-50 text-red-600 shadow-[0_12px_30px_rgba(220,38,38,0.08)]">
        <XCircle className="h-9 w-9 stroke-[2]" />
      </div>
    );
  }

  return (
    <div className="flex h-[76px] w-[76px] items-center justify-center rounded-[26px] bg-primary/10 text-primary shadow-[0_12px_30px_rgba(254,132,31,0.10)]">
      <Loader2 className="h-9 w-9 animate-spin stroke-[2.25]" />
    </div>
  );
}

function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const {
    clearCart,
  } = useCart();

  const [status, setStatus] =
    useState<PaymentState>('loading');

  const [message, setMessage] =
    useState('');

  const [refId, setRefId] =
    useState('');

  const [orderId, setOrderId] =
    useState<number | null>(null);

  const verificationStarted =
    useRef(false);

  const authority =
    searchParams.get('Authority');

  const statusParam =
    searchParams.get('Status');

  useEffect(() => {
    if (
      verificationStarted.current
    ) {
      return;
    }

    verificationStarted.current = true;

    let cancelled = false;
    let retryTimer:
      | ReturnType<typeof setTimeout>
      | null = null;

    async function verifyPayment(
      attempt = 0,
    ): Promise<void> {
      if (cancelled) {
        return;
      }

      if (!authority) {
        setStatus('error');
        setMessage(
          'اطلاعات تراکنش ناقص است.',
        );

        return;
      }

      if (
        String(statusParam || '')
          .toUpperCase() !== 'OK'
      ) {
        setStatus('error');
        setMessage(
          'پرداخت توسط کاربر لغو شد یا تراکنش ناموفق بود.',
        );

        return;
      }

      try {
        setStatus('loading');

        if (attempt > 0) {
          setMessage(
            'تراکنش در حال نهایی‌سازی است. وضعیت پرداخت دوباره بررسی می‌شود...',
          );
        }

        const response =
          await fetch(
            '/api/payment/verify',
            {
              method: 'POST',
              headers: {
                'Content-Type':
                  'application/json',
              },
              credentials: 'include',
              cache: 'no-store',
              body: JSON.stringify({
                authority,
              }),
            },
          );

        let data: {
          success?: boolean;
          status?: string;
          message?: string;
          error?: string;
          refId?: string;
          orderId?: number | string | null;
        } = {};

        try {
          data =
            await response.json();
        } catch {
          data = {};
        }

        if (cancelled) {
          return;
        }

        /*
         * یک درخواست دیگر ممکن است در حال تکمیل
         * همین Payment Session باشد.
         *
         * در این وضعیت نباید برای همیشه روی loading
         * بمانیم؛ وضعیت را دوباره بررسی می‌کنیم.
         */
        if (
          response.ok &&
          data.success &&
          data.status ===
            'processing'
        ) {
          if (
            attempt >=
            MAX_PROCESSING_ATTEMPTS
          ) {
            setStatus('error');
            setMessage(
              'تأیید پرداخت بیشتر از حد معمول زمان برد. لطفاً چند دقیقه بعد وضعیت سفارش خود را بررسی کنید.',
            );

            return;
          }

          retryTimer =
            setTimeout(() => {
              void verifyPayment(
                attempt + 1,
              );
            }, PROCESSING_RETRY_DELAY);

          return;
        }

        /*
         * پرداخت با موفقیت کامل شده است.
         */
        if (
          response.ok &&
          data.success
        ) {
          setStatus('success');

          setRefId(
            data.refId || '',
          );

          setOrderId(
            data.orderId
              ? Number(
                  data.orderId,
                )
              : null,
          );

          setMessage(
            data.message ||
              'پرداخت با موفقیت انجام شد و سفارش شما ثبت شده است.',
          );

          clearCart();

          return;
        }

        /*
         * خطای قطعی
         */
        setStatus('error');

        setMessage(
          data.message ||
            data.error ||
            'پرداخت تأیید نشد.',
        );
      } catch (error) {
        console.error(
          'Payment callback verification error:',
          error,
        );

        if (
          cancelled
        ) {
          return;
        }

        /*
         * اگر به خاطر یک خطای موقت شبکه
         * درخواست fail شد، چند بار دوباره تلاش می‌کنیم.
         */
        if (
          attempt <
          MAX_PROCESSING_ATTEMPTS
        ) {
          setMessage(
            'ارتباط با سرور برقرار نشد. وضعیت پرداخت دوباره بررسی می‌شود...',
          );

          retryTimer =
            setTimeout(() => {
              void verifyPayment(
                attempt + 1,
              );
            }, PROCESSING_RETRY_DELAY);

          return;
        }

        setStatus('error');

        setMessage(
          'خطا در برقراری ارتباط با سرور. لطفاً وضعیت پرداخت را دوباره بررسی کنید.',
        );
      }
    }

    void verifyPayment();

    return () => {
      cancelled = true;

      if (retryTimer) {
        clearTimeout(
          retryTimer,
        );
      }
    };
  }, [
    authority,
    statusParam,
    clearCart,
  ]);

  if (status === 'loading') {
    return (
      <PaymentCard>
        <div className="flex flex-col items-center text-center">
          <StatusIcon type="loading" />

          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/[0.055] px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />

            <span className="text-[11px] font-bold text-primary">
              پرداخت امن
            </span>
          </div>

          <h1 className="mt-4 text-[25px] font-black tracking-[-0.02em] text-slate-900 sm:text-[28px]">
            در حال بررسی پرداخت
          </h1>

          <p className="mt-2 max-w-sm text-sm leading-7 text-muted-foreground">
            {message ||
              'تراکنش شما در حال بررسی است. لطفاً این صفحه را نبندید.'}
          </p>

          <div className="mt-7 w-full rounded-[22px] border border-primary/[0.08] bg-primary/[0.035] p-4.5 sm:p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-primary shadow-sm">
                <ShieldCheck className="h-5 w-5" />
              </div>

              <div className="min-w-0 text-right">
                <p className="text-[10px] font-bold text-muted-foreground">
                  وضعیت تراکنش
                </p>

                <p className="mt-1 text-sm font-black text-slate-800">
                  در حال تأیید تراکنش با زرین‌پال...
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-center gap-2 text-[11px] text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />

            <span>
              لطفاً کمی صبر کنید
            </span>
          </div>
        </div>
      </PaymentCard>
    );
  }

  if (status === 'success') {
    return (
      <PaymentCard>
        <div className="flex flex-col items-center text-center">
          <StatusIcon type="success" />

          <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-primary">
            <Check className="h-3.5 w-3.5" />

            <span className="text-[11px] font-bold">
              پرداخت با موفقیت انجام شد
            </span>
          </div>

          <h1 className="mt-4 text-[26px] font-black tracking-[-0.02em] text-slate-900 sm:text-[30px]">
            سفارش شما ثبت شد
          </h1>

          <p className="mt-2 max-w-sm text-sm leading-7 text-muted-foreground">
            {message ||
              'پرداخت با موفقیت تأیید شد و سفارش شما ثبت شده است.'}
          </p>

          {(orderId || refId) && (
            <div className="mt-7 w-full space-y-3">
              {orderId && (
                <div className="rounded-[22px] border border-primary/[0.10] bg-primary/[0.035] p-5">
                  <div className="flex items-center justify-center gap-2">
                    <ReceiptText className="h-4 w-4 text-primary" />

                    <span className="text-[11px] font-bold text-muted-foreground">
                      شماره سفارش
                    </span>
                  </div>

                  <strong className="mt-2 block text-2xl font-black tracking-tight text-slate-900">
                    {orderId.toLocaleString(
                      'fa-IR',
                    )}
                  </strong>
                </div>
              )}

              {refId && (
                <div className="rounded-[22px] border border-black/[0.06] bg-slate-50/70 p-5">
                  <div className="flex items-center justify-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-slate-500" />

                    <span className="text-[11px] font-bold text-muted-foreground">
                      کد پیگیری پرداخت
                    </span>
                  </div>

                  <strong className="mt-2 block break-all font-mono text-sm font-bold text-slate-900">
                    {refId}
                  </strong>
                </div>
              )}
            </div>
          )}

          <div className="mt-7 grid w-full gap-2.5 sm:grid-cols-2">
            <Button
              type="button"
              onClick={() =>
                router.push(
                  '/account',
                )
              }
              className="h-12 rounded-xl font-bold shadow-[0_8px_24px_rgba(254,132,31,0.16)]"
            >
              مشاهده حساب کاربری
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() =>
                router.push(
                  '/shop',
                )
              }
              className="h-12 rounded-xl border-black/[0.08] bg-white font-bold"
            >
              بازگشت به رژیم‌ها
            </Button>
          </div>

          <p className="mt-5 text-[10px] leading-6 text-muted-foreground">
            اطلاعات سفارش شما در حساب کاربری ذخیره شده است.
          </p>
        </div>
      </PaymentCard>
    );
  }

  return (
    <PaymentCard>
      <div className="flex flex-col items-center text-center">
        <StatusIcon type="error" />

        <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 text-red-600">
          <CircleAlert className="h-3.5 w-3.5" />

          <span className="text-[11px] font-bold">
            تراکنش ناموفق
          </span>
        </div>

        <h1 className="mt-4 text-[26px] font-black tracking-[-0.02em] text-slate-900 sm:text-[30px]">
          پرداخت انجام نشد
        </h1>

        <p className="mt-2 max-w-sm text-sm leading-7 text-muted-foreground">
          {message ||
            'پرداخت شما تأیید نشد. می‌توانید دوباره تلاش کنید.'}
        </p>

        <div className="mt-7 w-full rounded-[22px] border border-red-100 bg-red-50/70 p-5 text-right">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-red-500 shadow-sm">
              <CircleAlert className="h-4.5 w-4.5" />
            </div>

            <div>
              <p className="text-[11px] font-black text-red-500">
                توجه
              </p>

              <p className="mt-1.5 text-xs leading-6 text-red-700">
                در صورت کسر شدن مبلغ از حساب، قبل از پرداخت مجدد وضعیت سفارش خود را بررسی کنید.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-7 w-full space-y-2.5">
          <Button
            type="button"
            onClick={() =>
              router.push(
                '/checkout',
              )
            }
            className="h-12 w-full rounded-xl font-bold shadow-[0_8px_24px_rgba(254,132,31,0.16)]"
          >
            تلاش مجدد برای پرداخت
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() =>
              router.push(
                '/shop',
              )
            }
            className="h-12 w-full rounded-xl border-black/[0.08] bg-white font-bold"
          >
            <ArrowLeft className="h-4 w-4" />

            بازگشت به رژیم‌ها
          </Button>
        </div>
      </div>
    </PaymentCard>
  );
}

function PaymentCallbackFallback() {
  return (
    <PaymentCard>
      <div className="flex flex-col items-center text-center">
        <StatusIcon type="loading" />

        <h1 className="mt-6 text-xl font-black text-slate-900 sm:text-2xl">
          در حال بررسی پرداخت...
        </h1>

        <p className="mt-2 text-sm leading-7 text-muted-foreground">
          لطفاً چند لحظه صبر کنید.
        </p>
      </div>
    </PaymentCard>
  );
}

export default function PaymentCallbackPage() {
  return (
    <main
      dir="rtl"
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#fffdf9] px-4 py-8 sm:px-6 sm:py-10"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-140px] h-[320px] w-[320px] -translate-x-1/2 rounded-full bg-primary/[0.055] blur-3xl" />

        <div className="absolute bottom-[-180px] right-[-120px] h-[320px] w-[320px] rounded-full bg-primary/[0.035] blur-3xl" />
      </div>

      <div className="relative z-10 w-full">
        <Suspense
          fallback={
            <PaymentCallbackFallback />
          }
        >
          <PaymentCallbackContent />
        </Suspense>
      </div>
    </main>
  );
}