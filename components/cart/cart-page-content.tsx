'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CreditCard,
  LogIn,
  Minus,
  Plus,
  ShoppingBag,
  ShoppingCart,
  ShieldCheck,
  Trash2,
  X,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

import { useCart } from '@/providers/cart-provider';
import { useAuth } from '@/providers/auth-provider';
import type { CartItem } from '@/types/cart';

const brandDark = 'var(--brand-orange-dark)';

function formatPrice(value?: string | number | null) {
  const numeric = Number(value || 0);
  return numeric ? numeric.toLocaleString('fa-IR') : '۰';
}

function CartItemCard({
  item,
  onRemove,
  onUpdateQuantity,
}: {
  item: CartItem;
  onRemove: (id: number) => void;
  onUpdateQuantity: (
    id: number,
    variationId: number | undefined,
    quantity: number,
  ) => void;
}) {
  const unitPrice = Number(item.price || 0);
  const totalPrice = unitPrice * item.quantity;

  const update = (quantity: number) => {
    onUpdateQuantity(item.id, item.variationId, quantity);
  };

  return (
    <article className="rounded-[24px] border border-slate-200/80 bg-white p-3.5 shadow-[0_6px_24px_rgba(30,35,25,.04)] transition hover:shadow-[0_14px_38px_rgba(30,35,25,.07)] sm:p-5">
      <div className="flex gap-3 sm:gap-5">
        <Link
          href={`/product/${item.slug}`}
          className="relative h-[92px] w-[92px] shrink-0 overflow-hidden rounded-2xl bg-[#FFF8F2] sm:h-[120px] sm:w-[120px]"
        >
          {item.image ? (
            <Image
              src={item.image}
              alt={item.name}
              fill
              sizes="(max-width: 640px) 92px, 120px"
              className="object-contain p-3"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <ShoppingBag className="h-8 w-8 text-[var(--brand-orange-dark)]/20" />
            </div>
          )}
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2.5">
            <Link
              href={`/product/${item.slug}`}
              className="line-clamp-2 text-[13px] font-black leading-6 text-slate-900 transition hover:text-[var(--brand-orange-dark)] sm:text-base"
            >
              {item.name}
            </Link>

            <button
              type="button"
              onClick={() => onRemove(item.id)}
              aria-label="حذف محصول"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-red-50 hover:text-red-500"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

{(item.attributes ?? []).length > 0 && (
  <div className="mt-2 flex flex-wrap gap-1.5">
    {(item.attributes ?? []).map((attribute) => (
      <span
        key={`${attribute.name}-${attribute.option}`}
        className="rounded-lg bg-slate-50 px-2 py-1 text-[9px] font-medium text-slate-500 sm:text-[10px]"
      >
        {attribute.name}: {attribute.option}
      </span>
    ))}
  </div>
)}

          <p className="mt-2.5 text-[10px] text-muted-foreground sm:text-xs">
            قیمت هر رژیم:
            <span className="mr-1 font-bold text-slate-700">
              {formatPrice(unitPrice)} تومان
            </span>
          </p>

          <div className="mt-3.5 flex flex-wrap items-end justify-between gap-3 sm:mt-4">
            <div className="flex h-9 items-center rounded-xl border border-slate-200 bg-slate-50 sm:h-10">
              <button
                type="button"
                onClick={() => update(item.quantity + 1)}
                aria-label="افزایش تعداد"
                className="flex h-9 w-9 items-center justify-center text-slate-600 transition hover:text-[var(--brand-orange-dark)] sm:h-10 sm:w-10"
              >
                <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>

              <span className="w-7 text-center text-xs font-black tabular-nums sm:w-8 sm:text-sm">
                {item.quantity.toLocaleString('fa-IR')}
              </span>

              <button
                type="button"
                onClick={() => update(item.quantity - 1)}
                disabled={item.quantity <= 1}
                aria-label="کاهش تعداد"
                className="flex h-9 w-9 items-center justify-center text-slate-600 transition hover:text-[var(--brand-orange-dark)] disabled:cursor-not-allowed disabled:opacity-30 sm:h-10 sm:w-10"
              >
                <Minus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>
            </div>

            <div className="text-left">
              <span className="block text-[9px] text-muted-foreground sm:text-[10px]">
                مبلغ
              </span>

              <strong className="mt-0.5 block text-sm font-black text-[var(--brand-orange-dark)] sm:text-lg">
                {formatPrice(totalPrice)}
                <span className="mr-1 text-[9px] font-medium text-muted-foreground sm:text-[10px]">
                  تومان
                </span>
              </strong>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function EmptyCart() {
  return (
    <main className="min-h-[70vh] bg-[#FCFDFC]">
      <div className="container flex min-h-[70vh] items-center justify-center py-10">
        <section className="w-full max-w-lg rounded-[28px] border border-slate-200/80 bg-white px-5 py-10 text-center shadow-[0_18px_55px_rgba(30,35,25,.06)] sm:px-10 sm:py-12">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[26px] bg-[var(--brand-orange)]/10 text-[var(--brand-orange-dark)]">
            <ShoppingCart className="h-9 w-9" />
          </div>

          <h1 className="mt-6 text-2xl font-black text-slate-900">
            سبد خریدت خالیه
          </h1>

          <p className="mx-auto mt-3 max-w-sm text-sm leading-7 text-muted-foreground">
            هنوز رژیمی به سبد خرید اضافه نکرده‌ای. رژیم‌های پرطرفدار را ببین و مسیرت را شروع کن.
          </p>

          <Link
            href="/shop"
            className="mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[var(--brand-orange-dark)] px-7 text-sm font-black text-white shadow-[0_10px_22px_rgba(225,76,43,.15)] transition hover:-translate-y-0.5 hover:bg-[#d94324]"
          >
            <ShoppingBag className="h-4 w-4" />
            مشاهده رژیم‌ها
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </section>
      </div>
    </main>
  );
}

function OrderSummary({
  totalItems,
  totalPrice,
  isLoggedIn,
  onCheckout,
  onClear,
}: {
  totalItems: number;
  totalPrice: number;
  isLoggedIn: boolean;
  onCheckout: () => void;
  onClear: () => void;
}) {
  return (
    <aside className="lg:sticky lg:top-24">
      <div className="overflow-hidden rounded-[26px] border border-slate-200/80 bg-white shadow-[0_10px_35px_rgba(30,35,25,.06)]">
        <div className="border-b border-border px-5 py-5 sm:px-6">
          <h2 className="text-lg font-black">خلاصه سفارش</h2>
          <p className="mt-1 text-[11px] text-muted-foreground">
            اطلاعات سفارش شما
          </p>
        </div>

        <div className="space-y-4 px-5 py-5 sm:px-6">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">تعداد اقلام</span>
            <span className="font-bold text-slate-800">
              {totalItems.toLocaleString('fa-IR')} عدد
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">جمع محصولات</span>
            <span className="font-bold text-slate-800">
              {formatPrice(totalPrice)} تومان
            </span>
          </div>

          <Separator />

          <div className="flex items-end justify-between gap-4">
            <span className="text-sm font-bold text-slate-900">
              مبلغ قابل پرداخت
            </span>

            <div className="text-left">
              <strong className="text-2xl font-black text-[var(--brand-orange-dark)]">
                {formatPrice(totalPrice)}
              </strong>
              <span className="mr-1 text-[10px] text-muted-foreground">
                تومان
              </span>
            </div>
          </div>
        </div>

        <div className="px-5 pb-5 sm:px-6">
          <button
            type="button"
            onClick={onCheckout}
            className="flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--brand-orange-dark)] px-5 text-sm font-black text-white shadow-[0_12px_25px_rgba(225,76,43,.16)] transition hover:-translate-y-0.5 hover:bg-[#d94324] active:translate-y-0"
          >
            {isLoggedIn ? (
              <>
                <CreditCard className="h-5 w-5" />
                ادامه ثبت سفارش
              </>
            ) : (
              <>
                <LogIn className="h-5 w-5" />
                ورود و ثبت سفارش
              </>
            )}

            <ArrowLeft className="h-4 w-4" />
          </button>

          <Link
            href="/shop"
            className="mt-2 flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 transition hover:border-orange-200 hover:text-[var(--brand-orange-dark)]"
          >
            ادامه خرید
          </Link>

          <button
            type="button"
            onClick={onClear}
            className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-xl text-xs font-medium text-slate-400 transition hover:bg-red-50 hover:text-red-500"
          >
            <Trash2 className="h-3.5 w-3.5" />
            خالی کردن سبد خرید
          </button>
        </div>

        <div className="border-t border-border bg-[#FFF9F5] px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 shrink-0 text-[var(--brand-orange-dark)]" />
            <p className="text-[10px] leading-5 text-muted-foreground">
              اطلاعات سفارش شما در فرآیند ثبت سفارش محافظت می‌شود.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default function CartPageContent() {
  const {
    items,
    removeItem,
    updateQuantity,
    totalPrice,
    totalItems,
    clearCart,
  } = useCart();

  const { isLoggedIn } = useAuth();
  const router = useRouter();

  const handleCheckout = () => {
    router.push(
      isLoggedIn
        ? '/checkout/questionnaire'
        : '/auth/login?redirect=/checkout/questionnaire',
    );
  };

  if (!items.length) {
    return <EmptyCart />;
  }

  return (
    <main className="min-h-screen bg-[#FCFDFC]">
      {/* Header */}
      <section className="border-b border-border bg-white">
        <div className="container py-7 sm:py-8 md:py-10">
          <div className="flex items-center justify-between gap-5">
            <div>
              <span className="text-xs font-black text-[var(--brand-orange-dark)]">
                سفارش شما
              </span>

              <h1 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">
                سبد خرید
              </h1>

              <p className="mt-2 text-[11px] text-muted-foreground sm:text-sm">
                {totalItems.toLocaleString('fa-IR')} آیتم در سبد خرید شما قرار دارد.
              </p>
            </div>

            <div className="hidden h-14 w-14 items-center justify-center rounded-2xl bg-[var(--brand-orange)]/10 text-[var(--brand-orange-dark)] sm:flex">
              <ShoppingCart className="h-6 w-6" />
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="container py-5 pb-16 sm:py-7 md:pb-20">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-8">
          <section className="min-w-0">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-slate-900">
                  رژیم‌های انتخاب‌شده
                </h2>

                <p className="mt-1 text-[10px] text-muted-foreground sm:text-[11px]">
                  محصولات سبد خرید
                </p>
              </div>

              <Link
                href="/shop"
                className="hidden items-center gap-1 text-xs font-bold text-[var(--brand-orange-dark)] sm:flex"
              >
                ادامه خرید
                <ArrowLeft className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {items.map((item) => (
                <CartItemCard
                  key={`${item.id}-${item.variationId || ''}`}
                  item={item}
                  onRemove={removeItem}
                  onUpdateQuantity={updateQuantity}
                />
              ))}
            </div>

            <Link
              href="/shop"
              className="mt-5 flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 sm:hidden"
            >
              <ArrowRight className="h-4 w-4" />
              ادامه خرید
            </Link>
          </section>

          <OrderSummary
            totalItems={totalItems}
            totalPrice={totalPrice}
            isLoggedIn={isLoggedIn}
            onCheckout={handleCheckout}
            onClear={clearCart}
          />
        </div>
      </div>
    </main>
  );
}