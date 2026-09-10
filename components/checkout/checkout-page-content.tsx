'use client';

import { useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Loader2,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  UserRound,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

import { useCart } from '@/providers/cart-provider';
import { useAuth } from '@/providers/auth-provider';

function formatPrice(value: number) {
  return Math.max(0, value).toLocaleString('fa-IR');
}

function normalizeDigits(value: string) {
  return value
    .replace(/[۰-۹]/g, (digit) =>
      String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)),
    )
    .replace(/[٠-٩]/g, (digit) =>
      String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)),
    );
}

function normalizePhone(value: string) {
  return normalizeDigits(value)
    .replace(/\D/g, '')
    .slice(0, 11);
}

export default function CheckoutPageContent() {
  const { items } = useCart();
  const { phone } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const questionnaireSessionId =
    searchParams.get('questionnaire')?.trim() || '';

  const [virtualNetworkId, setVirtualNetworkId] = useState('');
  const [orderPhone, setOrderPhone] = useState(phone || '');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const normalizedVirtualNetworkId = virtualNetworkId.trim();
  const normalizedPhone = normalizePhone(orderPhone);

  const displayTotal = useMemo(
    () =>
      items.reduce(
        (sum, item) =>
          sum + Number(item.price || 0) * item.quantity,
        0,
      ),
    [items],
  );

  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );

  const isVirtualNetworkIdValid =
    normalizedVirtualNetworkId.length >= 3;

  const isPhoneValid = /^09\d{9}$/.test(normalizedPhone);

  const canSubmit =
    items.length > 0 &&
    Boolean(questionnaireSessionId) &&
    isVirtualNetworkIdValid &&
    isPhoneValid &&
    !loading;

  const handlePayment = async () => {
    if (!items.length) {
      setError('سبد خرید شما خالی است.');
      return;
    }

    if (!questionnaireSessionId) {
      setError('ابتدا فرم اطلاعات رژیم را تکمیل کنید.');
      router.push('/questionnaire');
      return;
    }

    if (!isVirtualNetworkIdValid) {
      setError('لطفاً آیدی شبکه مجازی خود را وارد کنید.');
      return;
    }

    if (!isPhoneValid) {
      setError('شماره تلفن باید یک شماره موبایل معتبر باشد.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/payment/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        cache: 'no-store',
        body: JSON.stringify({
          virtualNetworkId: normalizedVirtualNetworkId,
          phone: normalizedPhone,
          questionnaireSessionId,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || 'خطا در ایجاد تراکنش پرداخت.',
        );
      }

      if (!data.paymentUrl) {
        throw new Error('آدرس درگاه پرداخت دریافت نشد.');
      }

      window.location.assign(data.paymentUrl);
    } catch (err) {
      console.error('Checkout payment error:', err);

      setError(
        err instanceof Error
          ? err.message
          : 'خطایی هنگام اتصال به درگاه پرداخت رخ داد.',
      );

      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <main className="min-h-[70vh] bg-[#fffdf9]">
        <div className="container flex min-h-[70vh] items-center justify-center py-12">
          <section className="w-full max-w-lg rounded-[30px] border border-border bg-white p-8 text-center shadow-[0_15px_50px_rgba(30,20,10,0.06)]">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <ShoppingBag className="h-7 w-7" />
            </div>

            <h1 className="mt-5 text-2xl font-black text-slate-900">
              سبد خرید خالی است
            </h1>

            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              برای تکمیل سفارش ابتدا یک رژیم به سبد خرید اضافه کنید.
            </p>

            <Link
              href="/shop"
              className="mt-6 inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-6 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
            >
              مشاهده رژیم‌ها
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fffdf9]">
      <section className="border-b border-border bg-white">
        <div className="container py-7 md:py-10">
          <span className="text-xs font-bold text-primary">
            مرحله نهایی سفارش
          </span>

          <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900 md:text-3xl">
            تکمیل سفارش
          </h1>

          <p className="mt-2 max-w-2xl text-xs leading-6 text-muted-foreground sm:text-sm">
            اطلاعات لازم برای دریافت و فعال‌سازی سفارش را وارد کنید و
            سپس به درگاه پرداخت منتقل شوید.
          </p>
        </div>
      </section>

      <div className="container py-6 pb-20 md:py-8">
        <div className="mb-7 flex items-center gap-2 overflow-x-auto pb-1">
          <div className="flex shrink-0 items-center gap-2 rounded-full bg-primary px-4 py-2 text-[11px] font-bold text-primary-foreground shadow-sm">
            <CheckCircle2 className="h-4 w-4" />
            اطلاعات سفارش
          </div>

          <div className="h-px w-8 shrink-0 bg-border" />

          <div className="flex shrink-0 items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-[11px] font-bold text-slate-500">
            <CreditCard className="h-4 w-4" />
            پرداخت
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-8">
          <section className="space-y-5">
            <section className="rounded-[28px] border border-border bg-white p-5 shadow-sm sm:p-7">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <UserRound className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    اطلاعات حساب
                  </h2>

                  <p className="mt-1 text-xs text-muted-foreground">
                    اطلاعات حساب کاربری شما
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-primary/[0.045] px-4 py-4">
                <div>
                  <span className="block text-[10px] text-muted-foreground">
                    شماره ثبت‌شده حساب
                  </span>

                  <strong
                    dir="ltr"
                    className="mt-1 block text-sm font-black text-slate-900"
                  >
                    {phone || '---'}
                  </strong>
                </div>

                <ShieldCheck className="h-5 w-5 text-primary" />
              </div>
            </section>

            <section className="rounded-[28px] border border-border bg-white p-5 shadow-sm sm:p-7">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Smartphone className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    اطلاعات دریافت سفارش
                  </h2>

                  <p className="mt-1 text-xs text-muted-foreground">
                    اطلاعات شبکه مجازی و شماره تلفن خود را وارد کنید.
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label
                    htmlFor="virtualNetworkId"
                    className="mb-2 block text-xs font-bold text-slate-700"
                  >
                    آیدی شبکه مجازی
                  </label>

                  <Input
                    id="virtualNetworkId"
                    value={virtualNetworkId}
                    onChange={(event) => {
                      setVirtualNetworkId(event.target.value);
                      setError('');
                    }}
                    placeholder="آیدی اکانت شبکه مجازی خود را وارد کنید"
                    autoComplete="off"
                    dir="ltr"
                    maxLength={120}
                    className="h-12 rounded-2xl text-left"
                  />

                  <p className="mt-2 text-[10px] leading-5 text-muted-foreground">
                    آیدی همان حسابی را وارد کنید که سفارش باید روی آن
                    فعال شود.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="orderPhone"
                    className="mb-2 block text-xs font-bold text-slate-700"
                  >
                    شماره تلفن
                  </label>

                  <Input
                    id="orderPhone"
                    value={orderPhone}
                    onChange={(event) => {
                      setOrderPhone(
                        normalizePhone(event.target.value),
                      );
                      setError('');
                    }}
                    inputMode="numeric"
                    autoComplete="tel"
                    maxLength={11}
                    placeholder="09123456789"
                    dir="ltr"
                    className="h-12 rounded-2xl text-left"
                  />

                  {orderPhone && !isPhoneValid && (
                    <p className="mt-2 text-[10px] font-semibold text-red-500">
                      شماره تلفن واردشده معتبر نیست.
                    </p>
                  )}
                </div>
              </div>
            </section>

            <section className="rounded-[28px] border border-border bg-white p-5 shadow-sm sm:p-7">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <CreditCard className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    روش پرداخت
                  </h2>

                  <p className="mt-1 text-xs text-muted-foreground">
                    پرداخت آنلاین از طریق زرین‌پال
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-primary/10 bg-primary/[0.035] p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                    <CreditCard className="h-4 w-4" />
                  </div>

                  <div>
                    <p className="text-sm font-black text-slate-900">
                      پرداخت آنلاین امن
                    </p>

                    <p className="mt-1 text-[10px] leading-5 text-muted-foreground">
                      پس از ایجاد تراکنش، به صفحه امن زرین‌پال منتقل می‌شوید.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <div className="rounded-2xl border border-primary/10 bg-primary/[0.035] p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />

                <div>
                  <p className="text-xs font-black text-slate-900">
                    پرداخت امن
                  </p>

                  <p className="mt-1 text-[10px] leading-6 text-muted-foreground">
                    مبلغ نهایی پرداخت از اطلاعات واقعی WooCommerce
                    در سمت سرور محاسبه می‌شود و اطلاعات قیمت مرورگر
                    قابل اعتماد نیست.
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-red-700">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

                <div>
                  <p className="text-xs font-black">
                    خطا در پرداخت
                  </p>

                  <p className="mt-1 text-xs leading-6">{error}</p>
                </div>
              </div>
            )}
          </section>

          <aside className="lg:sticky lg:top-24">
            <section className="overflow-hidden rounded-[28px] border border-border bg-white shadow-[0_12px_45px_rgba(30,20,10,0.07)]">
              <div className="border-b border-border p-5 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-black text-slate-900">
                      خلاصه سفارش
                    </h2>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {items.length.toLocaleString('fa-IR')} رژیم
                    </p>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/8 text-primary">
                    <ShoppingBag className="h-5 w-5" />
                  </div>
                </div>
              </div>

              <div className="max-h-[390px] overflow-y-auto p-5 sm:p-6">
                <div className="space-y-4">
                  {items.map((item) => {
                    const lineTotal =
                      Number(item.price || 0) * item.quantity;

                    return (
                      <div
                        key={`${item.id}-${item.variationId || ''}`}
                        className="flex gap-3"
                      >
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/[0.05] text-primary">
                          <ShoppingBag className="h-5 w-5" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 text-xs font-bold leading-6 text-slate-800">
                            {item.name}
                          </p>

                          <p className="mt-1 text-[10px] text-muted-foreground">
                            تعداد:{' '}
                            {item.quantity.toLocaleString('fa-IR')}
                          </p>

                          <p className="mt-1 text-xs font-black text-primary">
                            {formatPrice(lineTotal)} تومان
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <Separator />

              <div className="space-y-4 p-5 sm:p-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    تعداد اقلام
                  </span>

                  <span className="font-bold text-slate-800">
                    {totalItems.toLocaleString('fa-IR')}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    جمع فعلی سبد
                  </span>

                  <span className="font-bold text-slate-800">
                    {formatPrice(displayTotal)} تومان
                  </span>
                </div>

                <Separator />

                <div className="flex items-end justify-between gap-4">
                  <span className="text-sm font-black text-slate-900">
                    مبلغ نهایی
                  </span>

                  <div className="text-left">
                    <strong className="text-2xl font-black text-primary">
                      {formatPrice(displayTotal)}
                    </strong>

                    <span className="mr-1 text-[10px] text-muted-foreground">
                      تومان
                    </span>
                  </div>
                </div>

                <p className="text-[9px] leading-5 text-muted-foreground">
                  مبلغ بالا برای نمایش است و مبلغ واقعی هنگام ایجاد
                  تراکنش در سمت سرور از WooCommerce محاسبه می‌شود.
                </p>

                <Button
                  type="button"
                  onClick={() => void handlePayment()}
                  disabled={!canSubmit}
                  className="h-13 w-full gap-2 rounded-2xl text-sm font-black shadow-lg shadow-primary/10"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      در حال انتقال به درگاه...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-5 w-5" />
                      پرداخت و ثبت سفارش
                      <ArrowLeft className="h-4 w-4" />
                    </>
                  )}
                </Button>

                <Link
                  href="/cart"
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border text-xs font-bold text-slate-600 transition hover:border-primary/20 hover:text-primary"
                >
                  <ArrowRight className="h-4 w-4" />
                  بازگشت به سبد خرید
                </Link>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}