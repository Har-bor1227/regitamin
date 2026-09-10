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
  return numeric ? numeric.toLocaleString('fa-IR') : '—';
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
    favorite ? removeItem(product.id) : addWishlist(product.id);
  };

  return (
    <article
      dir="rtl"
      className={[
        'group relative flex shrink-0 snap-start flex-col overflow-hidden border border-slate-200/80 bg-white shadow-[0_10px_35px_rgba(30,35,25,.045)] transition-all duration-500',
        compact
          ? 'w-[245px] min-w-[245px] rounded-[24px]'
          : 'w-[265px] min-w-[265px] rounded-[26px] sm:w-[275px] sm:min-w-[275px]',
        'hover:-translate-y-1.5 hover:border-orange-200 hover:shadow-[0_22px_50px_rgba(30,35,25,.10)]',
      ].join(' ')}
    >
      <div className="absolute inset-x-4 top-0 z-10 h-px bg-gradient-to-r from-transparent via-orange-300/90 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      <div
        className={[
          'relative overflow-hidden',
          'aspect-[1.08]',
          visual === 'icon'
            ? `bg-gradient-to-br ${gradient}`
            : 'bg-[#FFF7F0]',
        ].join(' ')}
      >
        <div
          aria-hidden="true"
          className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-orange-400/20 blur-3xl transition-all duration-700 group-hover:scale-125"
        />

        <div
          aria-hidden="true"
          className="absolute -bottom-14 -left-12 h-36 w-36 rounded-full bg-amber-300/20 blur-3xl"
        />

        <Link
          href={`/product/${product.slug}`}
          className="relative z-[1] flex h-full w-full items-center justify-center"
        >
          {visual === 'image' && product.images?.[0] ? (
            <Image
              src={product.images[0].src}
              alt={product.images[0].alt || product.name}
              fill
              sizes="(max-width: 640px) 245px, 275px"
              className="object-contain p-6 transition duration-700 ease-out group-hover:scale-[1.06]"
            />
          ) : visual === 'image' ? (
            <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-white/85 shadow-sm backdrop-blur-sm">
              <Leaf className="h-7 w-7 text-[var(--brand-orange-dark)]/35" />
            </div>
          ) : (
            <div className="relative flex h-full w-full items-center justify-center">
              <div className="absolute h-36 w-36 rounded-full border border-white/80 bg-white/35 shadow-[0_20px_55px_rgba(225,76,43,.15)] backdrop-blur-sm transition-transform duration-700 group-hover:scale-110" />

              <div className="relative flex h-[84px] w-[84px] items-center justify-center rounded-[26px] border border-white/90 bg-white/80 shadow-[0_16px_40px_rgba(15,23,42,.10)] backdrop-blur-md transition-all duration-500 group-hover:scale-105 group-hover:-rotate-2">
                <ProductIcon className="h-9 w-9 text-[var(--brand-orange-dark)]" />
              </div>
            </div>
          )}
        </Link>

        {discount > 0 && (
          <div className="absolute right-3 top-3 z-[2] rounded-full bg-[var(--brand-orange-dark)] px-2.5 py-1 text-[9px] font-black text-white shadow-[0_8px_22px_rgba(225,76,43,.22)]">
            {discount}٪ تخفیف
          </div>
        )}

        <button
          type="button"
          onClick={toggleFavorite}
          aria-label={
            favorite ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'
          }
          className="absolute left-3 top-3 z-[2] flex h-9 w-9 items-center justify-center rounded-full border border-white/90 bg-white/95 text-slate-500 shadow-sm transition-all duration-300 hover:scale-110 hover:text-[var(--brand-orange-dark)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--brand-orange)]/15"
        >
          <Heart
            className={
              favorite
                ? 'h-[16px] w-[16px] fill-current text-[var(--brand-orange-dark)]'
                : 'h-[16px] w-[16px]'
            }
          />
        </button>
      </div>

      <div
        className={[
          'flex flex-1 flex-col',
          compact ? 'p-4' : 'p-4.5 sm:p-5',
        ].join(' ')}
      >
        {product.categories?.[0]?.name && (
          <span className="mb-2.5 w-fit max-w-full rounded-full bg-[var(--brand-orange)]/10 px-2.5 py-1 text-[9px] font-black text-[var(--brand-orange-dark)]">
            {product.categories[0].name}
          </span>
        )}

        <Link href={`/product/${product.slug}`}>
          <h3
            className={[
              'line-clamp-2 font-black leading-6 text-slate-950 transition-colors hover:text-[var(--brand-orange-dark)]',
              compact ? 'min-h-[48px] text-[13px]' : 'min-h-[50px] text-[14px]',
            ].join(' ')}
          >
            {product.name}
          </h3>
        </Link>

        {product.averageRating && (
          <div className="mt-2.5 flex items-center gap-1.5">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />

            <span className="text-[10px] font-bold text-slate-500">
              {product.averageRating}
            </span>
          </div>
        )}

        <div className="mt-auto pt-5">
          <span className="mb-1 block text-[9px] font-medium text-slate-400">
            قیمت رژیم
          </span>

          {product.onSale ? (
            <div className="flex flex-wrap items-end gap-x-1.5 gap-y-1">
              <strong
                className={
                  compact
                    ? 'text-lg font-black text-[var(--brand-orange-dark)]'
                    : 'text-xl font-black text-[var(--brand-orange-dark)]'
                }
              >
                {formatPrice(price)}
              </strong>

              <span className="pb-0.5 text-[9px] text-slate-400">
                تومان
              </span>

              <del className="pb-0.5 text-[9px] text-slate-400">
                {formatPrice(regularPrice)}
              </del>
            </div>
          ) : (
            <div className="flex items-end gap-1.5">
              <strong
                className={
                  compact
                    ? 'text-lg font-black text-slate-950'
                    : 'text-xl font-black text-slate-950'
                }
              >
                {formatPrice(price)}
              </strong>

              <span className="pb-0.5 text-[9px] text-slate-400">
                تومان
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={handleAddToCart}
            className={[
              'mt-4 flex w-full items-center justify-center gap-2 bg-slate-950 font-black text-white shadow-[0_12px_25px_rgba(15,23,42,.10)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[var(--brand-orange-dark)] hover:shadow-[0_14px_28px_rgba(225,76,43,.16)] active:translate-y-0 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--brand-orange)]/15',
              compact
                ? 'h-11 rounded-xl text-[10px]'
                : 'h-11 rounded-xl text-[11px] sm:text-xs',
            ].join(' ')}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            افزودن به سبد
          </button>
        </div>
      </div>
    </article>
  );
}
