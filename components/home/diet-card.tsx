
'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  CircleGauge,
  Heart,
  Leaf,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Star,
  Target,
  Trophy,
  TrendingDown,
} from 'lucide-react';

import { useCart } from '@/providers/cart-provider';
import { useWishlist } from '@/providers/wishlist-provider';
import type { ProductSummary } from '@/types/product';

function formatPrice(value?: string | number | null) {
  const numeric = Number(value || 0);

  return numeric > 0 ? numeric.toLocaleString('fa-IR') : '—';
}

function getDiscountPercent(product: ProductSummary) {
  const regular = Number(product.regularPrice || 0);
  const sale = Number(product.salePrice || product.price || 0);

  if (!product.onSale || regular <= 0 || sale <= 0 || sale >= regular) {
    return 0;
  }

  return Math.round(((regular - sale) / regular) * 100);
}

const productIcons = [
  Leaf,
  Sparkles,
  Target,
  Trophy,
  TrendingDown,
  ShieldCheck,
  CircleGauge,
  Heart,
];

const productGradients = [
  'from-orange-100 via-amber-50 to-rose-100',
  'from-amber-100 via-orange-50 to-yellow-100',
  'from-orange-100 via-white to-red-50',
  'from-rose-100 via-orange-50 to-amber-100',
  'from-yellow-100 via-orange-50 to-rose-100',
  'from-orange-100 via-white to-amber-100',
  'from-red-50 via-orange-100 to-yellow-50',
  'from-amber-100 via-orange-50 to-rose-50',
];

interface DietCardProps {
  product: ProductSummary;
  compact?: boolean;
  visual?: 'icon' | 'image';
  iconIndex?: number;
  onAdded?: (product: ProductSummary) => void;
}

export function DietCard({
  product,
  compact = false,
  visual = 'icon',
  iconIndex = 0,
  onAdded,
}: DietCardProps) {
  const { addItem } = useCart();

  const {
    addItem: addWishlist,
    removeItem,
    isInWishlist,
  } = useWishlist();

  const favorite = isInWishlist(product.id);
  const discount = getDiscountPercent(product);

  const price = Number(product.salePrice || product.price || 0);
  const regularPrice = Number(product.regularPrice || 0);

  const ProductIcon =
    productIcons[iconIndex % productIcons.length] || Sparkles;

  const gradient =
    productGradients[iconIndex % productGradients.length] ||
    productGradients[0];

  const productImage = product.images?.[0];

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.salePrice || product.price,
      quantity: 1,
      image: product.images?.[0]?.src,
    });

    onAdded?.(product);
  };

  const toggleFavorite = () => {
    if (favorite) {
      removeItem(product.id);
      return;
    }

    addWishlist(product.id);
  };

  return (
    <article
      dir="rtl"
      className={[
        'group relative flex shrink-0 snap-start flex-col overflow-hidden rounded-[26px]',
        'border border-orange-950/[0.06] bg-white',
        'shadow-[0_12px_34px_rgba(15,23,42,0.07)]',
        'transition-all duration-500 ease-out',
        'hover:-translate-y-1 hover:border-orange-200/80',
        'hover:shadow-[0_24px_50px_rgba(15,23,42,0.12)]',
        compact
          ? 'w-[252px] min-w-[252px]'
          : 'w-[270px] min-w-[270px] sm:w-[286px] sm:min-w-[286px]',
      ].join(' ')}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-7 top-0 z-20 h-px bg-gradient-to-r from-transparent via-[var(--brand-orange)]/75 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      />

      <div
        className={[
          'relative overflow-hidden border-b border-orange-950/[0.05]',
          'bg-gradient-to-br',
          visual === 'image'
            ? 'from-[#fff7f0] via-[#fffaf7] to-[#fff1e7]'
            : gradient,
          compact ? 'aspect-[1.02]' : 'aspect-[1.05]',
        ].join(' ')}
      >
        <div
          aria-hidden="true"
          className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-orange-400/15 blur-3xl transition-transform duration-700 group-hover:scale-125"
        />

        <div
          aria-hidden="true"
          className="absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-amber-300/20 blur-3xl transition-transform duration-700 group-hover:translate-x-2"
        />

        <div
          aria-hidden="true"
          className="absolute left-1/2 top-1/2 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/40 blur-[2px]"
        />

        <Link
          href={`/product/${product.slug}`}
          className="relative z-[1] block h-full w-full"
          aria-label={`مشاهده ${product.name}`}
        >
          {visual === 'image' && productImage ? (
            <div className="absolute inset-5 rounded-[24px] border border-white/80 bg-white/55 shadow-[0_16px_38px_rgba(15,23,42,0.06)] backdrop-blur-sm transition-all duration-500 group-hover:bg-white/70 group-hover:shadow-[0_20px_44px_rgba(15,23,42,0.09)]">
              <Image
                src={productImage.src}
                alt={productImage.alt || product.name}
                fill
                sizes="(max-width: 640px) 230px, 260px"
                className="object-contain p-5 transition duration-700 ease-out group-hover:scale-[1.07]"
              />
            </div>
          ) : visual === 'image' ? (
            <div className="flex h-full items-center justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-[24px] border border-white/90 bg-white/85 shadow-[0_16px_40px_rgba(15,23,42,0.10)]">
                <Leaf className="h-8 w-8 text-[var(--brand-orange-dark)]/40" />
              </div>
            </div>
          ) : (
            <div className="relative flex h-full w-full items-center justify-center">
              <div className="absolute h-36 w-36 rounded-full border border-white/80 bg-white/35 shadow-[0_20px_55px_rgba(225,76,43,0.15)] backdrop-blur-sm transition-transform duration-700 group-hover:scale-110" />

              <div className="relative flex h-[86px] w-[86px] items-center justify-center rounded-[28px] border border-white/95 bg-white/82 shadow-[0_16px_40px_rgba(15,23,42,0.10)] backdrop-blur-md transition-all duration-500 group-hover:-rotate-2 group-hover:scale-105">
                <ProductIcon className="h-9 w-9 text-[var(--brand-orange-dark)]" />
              </div>
            </div>
          )}
        </Link>

        {discount > 0 && (
          <div className="absolute right-3.5 top-3.5 z-[3] flex items-center gap-1.5 rounded-full bg-[var(--brand-orange-dark)] px-3 py-1.5 text-[9px] font-black text-white shadow-[0_10px_24px_rgba(225,76,43,0.24)]">
            <span>{discount}٪</span>
            <span>تخفیف</span>
          </div>
        )}

        <button
          type="button"
          onClick={toggleFavorite}
          aria-label={
            favorite ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'
          }
          className={[
            'absolute left-3.5 top-3.5 z-[3] flex h-10 w-10 items-center justify-center rounded-full',
            'border border-white/90 bg-white/90 text-slate-500',
            'shadow-[0_8px_20px_rgba(15,23,42,0.08)] backdrop-blur-md',
            'transition-all duration-300',
            'hover:scale-110 hover:text-[var(--brand-orange-dark)]',
            'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--brand-orange)]/15',
          ].join(' ')}
        >
          <Heart
            className={
              favorite
                ? 'h-[17px] w-[17px] fill-current text-[var(--brand-orange-dark)]'
                : 'h-[17px] w-[17px]'
            }
          />
        </button>
      </div>

      <div
        className={[
          'flex flex-1 flex-col',
          compact ? 'px-4 pb-4 pt-3.5' : 'px-4.5 pb-5 pt-4.5',
        ].join(' ')}
      >
        {product.categories?.[0]?.name && (
          <span className="mb-2 block text-[9px] font-black tracking-[-0.01em] text-[var(--brand-orange-dark)] sm:text-[10px]">
            {product.categories[0].name}
          </span>
        )}

        <Link href={`/product/${product.slug}`}>
          <h3
            className={[
              'line-clamp-2 font-black tracking-[-0.025em] text-slate-950 transition-colors',
              'hover:text-[var(--brand-orange-dark)]',
              compact
                ? 'min-h-[48px] text-[13px] leading-6'
                : 'min-h-[52px] text-[14px] leading-6',
            ].join(' ')}
          >
            {product.name}
          </h3>
        </Link>
        <div className="mt-3 border-t border-slate-100 pt-3.5">
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <span className="mb-1 block text-[9px] font-bold text-slate-400">
                قیمت
              </span>

              {product.onSale && regularPrice > price ? (
                <div className="flex flex-wrap items-end gap-x-1.5 gap-y-0.5">
                  <strong
                    className={[
                      'font-black leading-none text-[var(--brand-orange-dark)]',
                      compact ? 'text-[18px]' : 'text-[19px]',
                    ].join(' ')}
                  >
                    {formatPrice(price)}
                  </strong>

                  <span className="pb-0.5 text-[9px] font-bold text-slate-400">
                    تومان
                  </span>

                  <del className="w-full text-[9px] font-medium text-slate-300">
                    {formatPrice(regularPrice)}
                  </del>
                </div>
              ) : (
                <div className="flex items-end gap-1.5">
                  <strong
                    className={[
                      'font-black leading-none text-slate-950',
                      compact ? 'text-[18px]' : 'text-[19px]',
                    ].join(' ')}
                  >
                    {formatPrice(price)}
                  </strong>

                  <span className="pb-0.5 text-[9px] font-bold text-slate-400">
                    تومان
                  </span>
                </div>
              )}
            </div>

            {discount > 0 && (
              <span className="shrink-0 rounded-full bg-orange-50 px-2 py-1 text-[8px] font-black text-[var(--brand-orange-dark)]">
                خرید اقتصادی
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            className={[
              'mt-4 flex w-full items-center justify-center gap-2 rounded-[14px]',
              'bg-[var(--brand-orange-dark)] text-white',
              'font-black shadow-[0_12px_24px_rgba(225,76,43,0.18)]',
              'transition-all duration-300',
              'hover:-translate-y-0.5 hover:brightness-95 hover:shadow-[0_16px_30px_rgba(225,76,43,0.24)]',
              'active:translate-y-0',
              'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--brand-orange)]/15',
              compact
                ? 'h-11 text-[10px]'
                : 'h-11 text-[11px] sm:text-xs',
            ].join(' ')}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            <span>افزودن به سبد خرید</span>
          </button>
        </div>
      </div>
    </article>
  );
}

