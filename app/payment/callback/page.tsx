'use client';

import {
  Suspense,
  useEffect,
  useState,
} from 'react';
import {
  useRouter,
  useSearchParams,
} from 'next/navigation';
import {
  Check,
  Loader2,
  ReceiptText,
  XCircle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useCart } from '@/providers/cart-provider';

type PaymentState = 'loading' | 'success' | 'error';

function PaymentCard({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full max-w-md rounded-[30px] border border-border bg-white p-7 shadow-[0_20px_70px_rgba(30,20,10,0.08)] sm:p-8">
      {children}
    </div>
  );
}

function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearCart } = useCart();

  const [status, setStatus] = useState<PaymentState>('loading');
  const [message, setMessage] = useState('');
  const [refId, setRefId] = useState('');
  const [orderId, setOrderId] = useState<number | null>(null);

  const authority = searchParams.get('Authority');
  const statusParam = searchParams.get('Status');

  useEffect(() => {
    let cancelled = false;

    async function verifyPayment() {
      if (!authority) {
        if (!cancelled) {
          setStatus('error');
          setMessage('اطلاعات تراکنش ناقص است.');
        }
        return;
      }

      if (statusParam !== 'OK') {
        if (!cancelled) {
          setStatus('error');
          setMessage(
            'پرداخت توسط کاربر لغو شد یا تراکنش ناموفق بود.',
          );
        }
        return;
      }

      try {
        const response = await fetch('/api/payment/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          cache: 'no-store',
          body: JSON.stringify({ authority }),
        });

        const data = await response.json();

        if (cancelled) return;

        if (response.ok && data.success) {
          setStatus('success');
          setRefId(data.refId || '');
          setOrderId(
            data.orderId ? Number(data.orderId) : null,
          );
          setMessage(
            data.message || 'پرداخت با موفقیت انجام شد.',
          );
          clearCart();
          return;
        }

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

        if (!cancelled) {
          setStatus('error');
          setMessage(
            'خطا در برقراری ارتباط با سرور. لطفاً وضعیت پرداخت را دوباره بررسی کنید.',
          );
        }
      }
    }

    void verifyPayment();

    return () => {
      cancelled = true;
    };
  }, [authority, statusParam, clearCart]);

  if (status === 'loading') {
    return (
      <PaymentCard>
        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-primary/10 text-primary">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>

          <h1 className="mt-6 text-2xl font-black text-slate-900">
            در حال بررسی پرداخت
          </h1>

          <p className="mt-2 text-sm leading-7 text-muted-foreground">
            تراکنش شما در حال بررسی است. لطفاً این صفحه را نبندید.
          </p>

          <div className="mt-6 w-full rounded-2xl bg-primary/[0.045] p-4 text-right">
            <p className="text-[10px] font-bold text-muted-foreground">
              وضعیت
            </p>

            <p className="mt-1 text-xs font-black text-slate-800">
              در حال تأیید تراکنش با زرین‌پال...
            </p>
          </div>
        </div>
      </PaymentCard>
    );
  }

  if (status === 'success') {
    return (
      <PaymentCard>
        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-primary/10 text-primary">
            <Check className="h-8 w-8" />
          </div>

          <h1 className="mt-6 text-2xl font-black text-slate-900">
            پرداخت موفق بود
          </h1>

          <p className="mt-2 text-sm leading-7 text-muted-foreground">
            {message}
          </p>

          {orderId && (
            <div className="mt-6 w-full rounded-2xl bg-primary/[0.045] p-4">
              <div className="flex items-center justify-center gap-2">
                <ReceiptText className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground">
                  شماره سفارش
                </span>
              </div>

              <strong className="mt-2 block text-xl font-black text-slate-900">
                {orderId.toLocaleString('fa-IR')}
              </strong>
            </div>
          )}

          {refId && (
            <div className="mt-3 w-full rounded-2xl border border-border p-4">
              <span className="block text-[10px] text-muted-foreground">
                کد پیگیری پرداخت
              </span>

              <strong className="mt-2 block font-mono text-sm text-slate-900">
                {refId}
              </strong>
            </div>
          )}

          <Button
            type="button"
            onClick={() => router.push('/account')}
            className="mt-6 h-12 w-full rounded-xl font-bold"
          >
            مشاهده حساب کاربری
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/shop')}
            className="mt-2 h-12 w-full rounded-xl font-bold"
          >
            بازگشت به رژیم‌ها
          </Button>
        </div>
      </PaymentCard>
    );
  }

  return (
    <PaymentCard>
      <div className="flex flex-col items-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-red-50 text-red-600">
          <XCircle className="h-8 w-8" />
        </div>

        <h1 className="mt-6 text-2xl font-black text-slate-900">
          پرداخت ناموفق بود
        </h1>

        <p className="mt-2 text-sm leading-7 text-muted-foreground">
          {message}
        </p>

        <div className="mt-6 w-full rounded-2xl bg-red-50 p-4 text-right">
          <p className="text-[10px] font-bold text-red-500">
            توجه
          </p>

          <p className="mt-1 text-xs leading-6 text-red-700">
            در صورت کسر شدن مبلغ از حساب، قبل از پرداخت مجدد وضعیت
            سفارش خود را بررسی کنید.
          </p>
        </div>

        <Button
          type="button"
          onClick={() => router.push('/checkout')}
          className="mt-6 h-12 w-full rounded-xl font-bold"
        >
          بازگشت و تلاش مجدد
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/shop')}
          className="mt-2 h-12 w-full rounded-xl font-bold"
        >
          بازگشت به رژیم‌ها
        </Button>
      </div>
    </PaymentCard>
  );
}

function PaymentCallbackFallback() {
  return (
    <PaymentCard>
      <div className="flex flex-col items-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-primary/10 text-primary">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>

        <h1 className="mt-6 text-xl font-black text-slate-900">
          در حال بررسی پرداخت...
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          لطفاً صبر کنید.
        </p>
      </div>
    </PaymentCard>
  );
}

export default function PaymentCallbackPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fffdf9] px-4 py-10">
      <Suspense fallback={<PaymentCallbackFallback />}>
        <PaymentCallbackContent />
      </Suspense>
    </main>
  );
}