'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

import {
  ArrowLeft,
  Heart,
  PackageOpen,
  ShoppingCart,
  Trash2,
} from 'lucide-react';

import { useWishlist } from '@/providers/wishlist-provider';
import type { ProductSummary } from '@/types/product';

function formatPrice(value?: string | number | null) {
  return Number(value || 0).toLocaleString('fa-IR');
}

function getDiscountPercent(product: ProductSummary) {
  const regular = Number(product.regularPrice || 0);
  const sale = Number(product.salePrice || product.price || 0);

  if (
    !product.onSale ||
    regular <= 0 ||
    sale <= 0 ||
    sale >= regular
  ) {
    return 0;
  }

  return Math.round(((regular - sale) / regular) * 100);
}

function WishlistCard({
  product,
  priority = false,
  onRemove,
}: {
  product: ProductSummary;
  priority?: boolean;
  onRemove: (id: number) => void;
}) {
  const discount = getDiscountPercent(product);
  const currentPrice = Number(
    product.salePrice || product.price || 0,
  );
  const regularPrice = Number(product.regularPrice || 0);

  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-[24px] border border-border/80 bg-white shadow-[0_8px_30px_rgba(30,20,10,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-[0_18px_50px_rgba(30,20,10,0.09)]">
      <div className="relative aspect-[0.95] overflow-hidden bg-primary/[0.035]">
        <Link
          href={`/product/${product.slug}`}
          className="block h-full"
        >
          {product.images?.[0] ? (
            <Image
              src={product.images[0].src}
              alt={product.images[0].alt || product.name}
              fill
              priority={priority}
              sizes="(max-width: 640px) 46vw, (max-width: 1024px) 30vw, 250px"
              className="object-contain p-4 transition-transform duration-500 group-hover:scale-[1.04] sm:p-6"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <PackageOpen className="h-10 w-10 text-primary/20" />
            </div>
          )}
        </Link>

        {discount > 0 && (
          <span className="absolute right-3 top-3 rounded-full bg-primary px-3 py-1.5 text-[10px] font-bold text-primary-foreground shadow-sm">
            {discount}٪ تخفیف
          </span>
        )}

        <button
          type="button"
          onClick={() => onRemove(product.id)}
          aria-label="حذف از علاقه‌مندی‌ها"
          className="absolute left-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border border-white bg-white/95 text-slate-500 shadow-sm transition-colors hover:bg-red-50 hover:text-red-500"
        >
          <Trash2 className="h-[17px] w-[17px]" />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        {product.categories?.[0]?.name && (
          <span className="mb-2 w-fit max-w-full truncate rounded-full bg-primary/8 px-2.5 py-1 text-[10px] font-bold text-primary">
            {product.categories[0].name}
          </span>
        )}

        <Link href={`/product/${product.slug}`}>
          <h2 className="line-clamp-2 min-h-[48px] text-sm font-black leading-6 text-slate-900 transition-colors hover:text-primary sm:text-[15px]">
            {product.name}
          </h2>
        </Link>

        {product.averageRating && (
          <div className="mt-2 text-[11px] text-muted-foreground">
            امتیاز{' '}
            <strong className="text-slate-700">
              {product.averageRating}
            </strong>
          </div>
        )}

        <div className="mt-auto pt-5">
          {product.onSale ? (
            <div className="flex flex-wrap items-end gap-x-2 gap-y-1">
              <span className="text-xl font-black text-primary">
                {formatPrice(currentPrice)}
              </span>

              <span className="pb-1 text-[10px] text-muted-foreground">
                تومان
              </span>

              <del className="pb-1 text-[11px] text-muted-foreground">
                {formatPrice(regularPrice)}
              </del>
            </div>
          ) : (
            <div className="flex items-end gap-2">
              <span className="text-xl font-black text-slate-900">
                {formatPrice(currentPrice)}
              </span>

              <span className="pb-1 text-[10px] text-muted-foreground">
                تومان
              </span>
            </div>
          )}

          <Link
            href={`/product/${product.slug}`}
            className="mt-4 flex h-11 items-center justify-center gap-2 rounded-[14px] border border-primary/20 bg-primary/[0.04] text-xs font-bold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            مشاهده رژیم
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}

function WishlistSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-[24px] border border-border bg-white p-3 shadow-sm sm:p-4"
        >
          <div className="aspect-square animate-pulse rounded-2xl bg-slate-100" />

          <div className="mt-4 space-y-2">
            <div className="h-3 w-1/3 animate-pulse rounded-full bg-slate-100" />
            <div className="h-4 w-full animate-pulse rounded-full bg-slate-100" />
            <div className="h-4 w-2/3 animate-pulse rounded-full bg-slate-100" />
          </div>

          <div className="mt-5 h-10 animate-pulse rounded-xl bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

function EmptyWishlist() {
  return (
    <section className="rounded-[32px] border border-dashed border-border bg-white px-6 py-14 text-center shadow-sm sm:py-20">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[26px] bg-primary/8 text-primary">
        <Heart className="h-9 w-9" />
      </div>

      <h2 className="mt-6 text-2xl font-black text-slate-900">
        هنوز چیزی ذخیره نکرده‌ای
      </h2>

      <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-muted-foreground">
        رژیم‌هایی که دوست داری را به علاقه‌مندی‌ها اضافه کن تا هر
        زمان خواستی سریع به آن‌ها برگردی.
      </p>

      <Link
        href="/shop"
        className="mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-7 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/10 transition hover:bg-primary/90"
      >
        <ShoppingCart className="h-4 w-4" />
        مشاهده رژیم‌ها
        <ArrowLeft className="h-4 w-4" />
      </Link>
    </section>
  );
}

export default function WishlistPageContent() {
  const { items, removeItem, totalItems } = useWishlist();

  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    if (items.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    async function loadWishlist() {
      setLoading(true);

      try {
        const response = await fetch(
          `/api/products?ids=${items.join(',')}`,
          { cache: 'no-store' },
        );

        if (!response.ok) {
          throw new Error('Failed to load wishlist');
        }

        const data = await response.json();

        if (!cancelled) {
          setProducts(data.products || []);
        }
      } catch (error) {
        console.error('Failed to load wishlist:', error);

        if (!cancelled) {
          setProducts([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadWishlist();

    return () => {
      cancelled = true;
    };
  }, [items]);

  return (
    <main className="min-h-screen bg-[#fffdf9]">
      <section className="border-b border-border bg-white">
        <div className="container py-7 md:py-10">
          <div className="flex items-center justify-between gap-5">
            <div>
              <span className="text-xs font-bold text-primary">
                انتخاب‌های من
              </span>

              <h1 className="mt-1 text-2xl font-black text-slate-900 md:text-3xl">
                علاقه‌مندی‌ها
              </h1>

              <p className="mt-2 text-xs text-muted-foreground sm:text-sm">
                رژیم‌هایی که برای بعد ذخیره کرده‌ای.
              </p>
            </div>

            <div className="hidden h-14 w-14 items-center justify-center rounded-2xl bg-primary/8 text-primary sm:flex">
              <Heart className="h-6 w-6" />
            </div>
          </div>
        </div>
      </section>

      <div className="container py-6 pb-16 md:py-8 md:pb-20">
        {totalItems > 0 && (
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black text-slate-900 sm:text-base">
                ذخیره‌شده‌ها
              </h2>

              <p className="mt-1 text-[11px] text-muted-foreground">
                {totalItems.toLocaleString('fa-IR')} مورد
              </p>
            </div>

            <Link
              href="/shop"
              className="hidden items-center gap-1 text-xs font-bold text-primary sm:flex"
            >
              ادامه جستجو
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>
        )}

        {loading ? (
          <WishlistSkeleton />
        ) : products.length === 0 ? (
          <EmptyWishlist />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
              {products.map((product, index) => (
                <WishlistCard
                  key={product.id}
                  product={product}
                  priority={index < 4}
                  onRemove={removeItem}
                />
              ))}
            </div>

            <div className="mt-8 flex justify-center sm:hidden">
              <Link
                href="/shop"
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-white text-xs font-bold text-slate-600"
              >
                ادامه جستجوی رژیم‌ها
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}