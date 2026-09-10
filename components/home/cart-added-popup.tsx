import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Check, ShoppingCart, X } from 'lucide-react';
import type { ProductSummary } from '@/types/product';

export interface CartPopupData {
  product: ProductSummary;
}

interface CartAddedPopupProps {
  data: CartPopupData | null;
  onClose: () => void;
}

export function CartAddedPopup({ data, onClose }: CartAddedPopupProps) {
  if (!data) {
    return null;
  }

  return (
    <div
      className="fixed inset-x-3 bottom-3 z-[100] sm:inset-x-auto sm:bottom-5 sm:right-5 sm:w-[390px]"
      dir="rtl"
    >
      <div className="relative overflow-hidden rounded-[30px] border border-white/90 bg-white/95 p-4 shadow-[0_28px_80px_rgba(15,23,42,.18)] backdrop-blur-2xl">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-1 bg-gradient-to-l from-[var(--brand-orange-dark)] via-orange-400 to-amber-300"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-16 -top-16 h-40 w-40 rounded-full bg-orange-200/30 blur-3xl"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-20 -right-16 h-36 w-36 rounded-full bg-orange-100/50 blur-3xl"
        />

        <button
          type="button"
          onClick={onClose}
          aria-label="بستن اعلان"
          className="absolute left-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-slate-100 bg-white text-slate-400 shadow-sm transition-all duration-300 hover:scale-105 hover:bg-slate-50 hover:text-slate-700"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-sm">
              <Check className="h-5 w-5" strokeWidth={3} />
            </div>

            <div className="min-w-0 pr-8">
              <p className="text-[10px] font-black text-emerald-600">
                با موفقیت به سبد اضافه شد
              </p>

              <p className="mt-1 text-[11px] font-bold text-slate-400">
                انتخابت ذخیره شد و آماده ادامه خرید است.
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-2.5">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[18px] bg-gradient-to-br from-orange-50 via-white to-amber-50">
              {data.product.images?.[0] ? (
                <Image
                  src={data.product.images[0].src}
                  alt={data.product.images[0].alt || data.product.name}
                  fill
                  sizes="64px"
                  className="object-contain p-2"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-[var(--brand-orange-dark)]/50" />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <span className="text-[9px] font-bold text-slate-400">
                محصول انتخاب‌شده
              </span>

              <h3 className="mt-1 line-clamp-2 text-[13px] font-black leading-6 text-slate-950">
                {data.product.name}
              </h3>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <Link
              href="/cart"
              onClick={onClose}
              className="group flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 text-[10px] font-black text-white shadow-[0_10px_25px_rgba(15,23,42,.12)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-800"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              نمایش سبد خرید
            </Link>

            <Link
              href={`/product/${data.product.slug}`}
              onClick={onClose}
              className="group flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-[10px] font-black text-slate-700 transition-all duration-300 hover:-translate-y-0.5 hover:border-orange-200 hover:bg-orange-50 hover:text-[var(--brand-orange-dark)]"
            >
              مشاهده محصول
              <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
