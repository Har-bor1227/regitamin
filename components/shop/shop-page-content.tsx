'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Heart,
  Leaf,
  Search,
  ShoppingCart,
  SlidersHorizontal,
  Sparkles,
  Star,
  X,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { EmptyState } from '@/components/shop/empty-state';

import { useCart } from '@/providers/cart-provider';
import { useWishlist } from '@/providers/wishlist-provider';

import type { Category } from '@/types/category';
import type { ProductSummary } from '@/types/product';

interface ShopPageContentProps {
  products: ProductSummary[];
  currentPage: number;
  totalPages: number;
  total: number;
  categories: Category[];
  initialSearch: string;
  initialMinPrice?: number;
  initialMaxPrice?: number;
  initialCategory: number | null;
  initialOrderby: string;
  priceRange: [number, number];
}

const brandOrange = 'var(--brand-orange)';
const brandDark = 'var(--brand-orange-dark)';

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

function ProductCard({
  product,
  priority = false,
}: {
  product: ProductSummary;
  priority?: boolean;
}) {
  const { addItem } = useCart();
  const { addItem: addWishlist, removeItem, isInWishlist } = useWishlist();

  const favorite = isInWishlist(product.id);
  const discount = getDiscountPercent(product);
  const price = Number(product.salePrice || product.price || 0);
  const regularPrice = Number(product.regularPrice || 0);

  const addToCart = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.salePrice || product.price,
      quantity: 1,
      image: product.images?.[0]?.src,
    });
  };

  const toggleWishlist = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    favorite ? removeItem(product.id) : addWishlist(product.id);
  };

  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-[0_6px_24px_rgba(30,35,25,.04)] transition duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-[0_18px_42px_rgba(30,35,25,.08)]">
      <div className="relative aspect-square overflow-hidden bg-[#FFF8F2]">
        <Link href={`/product/${product.slug}`} className="block h-full">
          {product.images?.[0] ? (
            <Image
              src={product.images[0].src}
              alt={product.images[0].alt || product.name}
              fill
              priority={priority}
              sizes="(max-width: 640px) 46vw, (max-width: 768px) 31vw, (max-width: 1280px) 23vw, 280px"
              className="object-contain p-4 transition duration-500 group-hover:scale-[1.05] sm:p-5"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Leaf className="h-10 w-10 text-[var(--brand-orange-dark)]/20" />
            </div>
          )}
        </Link>

        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
          {discount > 0 ? (
            <span className="rounded-full bg-[var(--brand-orange-dark)] px-2.5 py-1.5 text-[10px] font-black text-white shadow-sm">
              {discount}٪ تخفیف
            </span>
          ) : (
            <span />
          )}

          <button
            type="button"
            onClick={toggleWishlist}
            aria-label={
              favorite
                ? 'حذف از علاقه‌مندی‌ها'
                : 'افزودن به علاقه‌مندی‌ها'
            }
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/90 bg-white/95 text-slate-500 shadow-sm backdrop-blur transition hover:text-[var(--brand-orange-dark)] focus-visible:ring-4 focus-visible:ring-[var(--brand-orange)]/15"
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
      </div>

      <div className="flex flex-1 flex-col p-4">
        {product.categories?.[0]?.name && (
          <span className="mb-2 w-fit max-w-full truncate rounded-full bg-[var(--brand-orange)]/10 px-2.5 py-1 text-[10px] font-bold text-[var(--brand-orange-dark)]">
            {product.categories[0].name}
          </span>
        )}

        <Link href={`/product/${product.slug}`}>
          <h2 className="line-clamp-2 min-h-[48px] text-[13px] font-black leading-6 text-slate-900 transition hover:text-[var(--brand-orange-dark)] sm:text-[15px]">
            {product.name}
          </h2>
        </Link>

        {product.averageRating && (
          <div className="mt-2 flex items-center gap-1.5 text-[10px] text-slate-400 sm:text-[11px]">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="font-semibold text-slate-500">
              {product.averageRating}
            </span>
            {product.ratingCount > 0 && (
              <span>
                ({product.ratingCount.toLocaleString('fa-IR')})
              </span>
            )}
          </div>
        )}

        <div className="mt-auto pt-4">
          {product.onSale ? (
            <div className="flex flex-wrap items-end gap-x-2 gap-y-1">
              <strong className="text-lg font-black text-[var(--brand-orange-dark)] sm:text-xl">
                {formatPrice(price)}
              </strong>
              <span className="pb-0.5 text-[9px] text-muted-foreground sm:text-[10px]">
                تومان
              </span>
              <del className="pb-0.5 text-[10px] text-muted-foreground sm:text-[11px]">
                {formatPrice(regularPrice)}
              </del>
            </div>
          ) : (
            <div className="flex items-end gap-2">
              <strong className="text-lg font-black text-slate-900 sm:text-xl">
                {formatPrice(price)}
              </strong>
              <span className="pb-0.5 text-[9px] text-muted-foreground sm:text-[10px]">
                تومان
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={addToCart}
            className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[var(--brand-orange-dark)] text-[11px] font-black text-white shadow-[0_8px_20px_rgba(225,76,43,.14)] transition hover:-translate-y-0.5 hover:bg-[#d94324] active:translate-y-0 focus-visible:ring-4 focus-visible:ring-[var(--brand-orange)]/15 sm:h-11 sm:text-sm"
          >
            <ShoppingCart className="h-4 w-4" />
            افزودن به سبد
          </button>
        </div>
      </div>
    </article>
  );
}

function CategoryBar({
  categories,
  selectedCategory,
  onSelect,
}: {
  categories: Category[];
  selectedCategory: number | null;
  onSelect: (categoryId: number | null) => void;
}) {
  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
      {[
        { id: null, label: 'همه رژیم‌ها' },
        ...categories.map((category) => ({
          id: category.id,
          label: category.name,
        })),
      ].map((item) => {
        const active = selectedCategory === item.id;

        return (
          <button
            key={item.id ?? 'all'}
            type="button"
            onClick={() => onSelect(item.id)}
            className={[
              'shrink-0 rounded-full px-4 py-2.5 text-xs font-bold transition-all',
              active
                ? 'bg-[var(--brand-orange-dark)] text-white shadow-[0_7px_17px_rgba(225,76,43,.16)]'
                : 'border border-slate-200 bg-white text-slate-600 hover:border-orange-200 hover:bg-[#FFF8F2] hover:text-[var(--brand-orange-dark)]',
            ].join(' ')}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

function SearchBanner({
  search,
  onClear,
}: {
  search: string;
  onClear: () => void;
}) {
  if (!search) return null;

  return (
    <div className="mb-5 flex items-center justify-between gap-3 rounded-2xl border border-orange-100 bg-[#FFF8F2] px-4 py-3">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-orange)]/10 text-[var(--brand-orange-dark)]">
          <Search className="h-4 w-4" />
        </span>

        <p className="truncate text-xs font-semibold text-slate-600">
          نتایج جستجو برای:
          <span className="mr-1 font-black text-slate-900">
            «{search}»
          </span>
        </p>
      </div>

      <button
        type="button"
        onClick={onClear}
        aria-label="پاک کردن جستجو"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-white hover:text-[var(--brand-orange-dark)]"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

function Pagination({
  currentPage,
  totalPages,
  searchParams,
}: {
  currentPage: number;
  totalPages: number;
  searchParams: URLSearchParams;
}) {
  if (totalPages <= 1) return null;

  const buildUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());

    if (page <= 1) params.delete('page');
    else params.set('page', String(page));

    const query = params.toString();
    return query ? `/shop?${query}` : '/shop';
  };

  const start = Math.max(
    1,
    Math.min(currentPage - 2, Math.max(1, totalPages - 4)),
  );
  const end = Math.min(totalPages, start + 4);

  return (
    <nav
      aria-label="صفحه‌بندی فروشگاه"
      className="mt-10 flex items-center justify-center gap-1.5"
    >
      <PageLink
        href={buildUrl(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        icon={<ChevronRight className="h-4 w-4" />}
      />

      {Array.from(
        { length: end - start + 1 },
        (_, index) => start + index,
      ).map((page) => (
        <Link
          key={page}
          href={buildUrl(page)}
          className={[
            'flex h-10 min-w-10 items-center justify-center rounded-xl px-2 text-xs font-bold transition',
            page === currentPage
              ? 'bg-[var(--brand-orange-dark)] text-white shadow-[0_7px_17px_rgba(225,76,43,.16)]'
              : 'border border-slate-200 bg-white text-slate-600 hover:border-orange-200 hover:bg-[#FFF8F2] hover:text-[var(--brand-orange-dark)]',
          ].join(' ')}
        >
          {page.toLocaleString('fa-IR')}
        </Link>
      ))}

      <PageLink
        href={buildUrl(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        icon={<ChevronLeft className="h-4 w-4" />}
      />
    </nav>
  );
}

function PageLink({
  href,
  disabled,
  icon,
}: {
  href: string;
  disabled: boolean;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-disabled={disabled}
      className={[
        'flex h-10 w-10 items-center justify-center rounded-xl border text-sm transition',
        disabled
          ? 'pointer-events-none border-slate-100 bg-slate-50 text-slate-300'
          : 'border-slate-200 bg-white text-slate-600 hover:border-orange-200 hover:bg-[#FFF8F2] hover:text-[var(--brand-orange-dark)]',
      ].join(' ')}
    >
      {icon}
    </Link>
  );
}

export default function ShopPageContent({
  products,
  currentPage,
  totalPages,
  total,
  categories,
  initialSearch,
  initialCategory,
  initialOrderby,
}: ShopPageContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [sortBy, setSortBy] = useState(initialOrderby || 'date');
  const [selectedCategory, setSelectedCategory] =
    useState<number | null>(initialCategory);
  const [mobileCategoriesOpen, setMobileCategoriesOpen] =
    useState(false);

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === '') params.delete(key);
        else params.set(key, value);
      });

      if ('category' in updates || 'orderby' in updates) {
        params.delete('page');
      }

      const query = params.toString();
      router.push(query ? `/shop?${query}` : '/shop', {
        scroll: false,
      });
    },
    [router, searchParams],
  );

  const handleSortChange = (value: string | null) => {
    if (!value) return;
    setSortBy(value);
    updateParams({ orderby: value });
  };

  const handleCategoryChange = (categoryId: number | null) => {
    const nextCategory = categoryId === selectedCategory ? null : categoryId;

    setSelectedCategory(nextCategory);
    updateParams({
      category: nextCategory !== null ? String(nextCategory) : null,
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearSearch = () => updateParams({ search: null });

  const sortLabels: Record<string, string> = {
    date: 'جدیدترین',
    'price-asc': 'ارزان‌ترین',
    'price-desc': 'گران‌ترین',
    popularity: 'محبوب‌ترین',
    rating: 'بالاترین امتیاز',
  };

  return (
    <main className="min-h-screen bg-[#FCFDFC]">
      {/* Intro */}
      <section className="border-b border-border bg-white">
        <div className="container py-7 sm:py-9 md:py-11">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-orange)]/10 px-3 py-2 text-[10px] font-black text-[var(--brand-orange-dark)] sm:text-[11px]">
                <Sparkles className="h-4 w-4" />
                فروشگاه رژیتامین
              </span>

              <h1 className="mt-3 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl md:text-4xl">
                رژیم مناسب هدفت را پیدا کن
              </h1>

              <p className="mt-2 max-w-xl text-xs leading-7 text-slate-500 sm:text-sm md:text-base">
                رژیم‌ها را بررسی کن، بر اساس هدفت انتخاب کن و مناسب‌ترین گزینه را برای خودت پیدا کن.
              </p>
            </div>

            <div className="hidden items-center gap-3 rounded-2xl border border-orange-100 bg-[#FFF9F5] px-4 py-3 md:flex">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand-orange)]/10 text-[var(--brand-orange-dark)]">
                <Leaf className="h-5 w-5" />
              </div>

              <div>
                <span className="block text-[10px] text-slate-400">
                  تعداد گزینه‌ها
                </span>
                <strong className="text-sm font-black text-slate-800">
                  {total.toLocaleString('fa-IR')} رژیم
                </strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="border-b border-border bg-white">
        <div className="container py-3.5 sm:py-4">
          <div className="flex items-center gap-3">
            <span className="hidden shrink-0 text-xs font-bold text-slate-400 sm:block">
              دسته‌بندی:
            </span>

            <div className="min-w-0 flex-1">
              <CategoryBar
                categories={categories}
                selectedCategory={selectedCategory}
                onSelect={handleCategoryChange}
              />
            </div>

            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-10 w-10 shrink-0 rounded-xl border-slate-200 bg-white text-slate-600 hover:border-orange-200 hover:bg-[#FFF8F2] hover:text-[var(--brand-orange-dark)] sm:hidden"
              onClick={() => setMobileCategoriesOpen(true)}
              aria-label="دسته‌بندی‌ها"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Products */}
      <div className="container py-5 pb-16 sm:py-7 md:pb-20">
        <SearchBanner search={initialSearch} onClear={clearSearch} />

        <div className="mb-5 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-[0_5px_20px_rgba(30,35,25,.03)] sm:p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] text-slate-400 sm:text-xs">نمایش</p>
              <h2 className="mt-0.5 text-sm font-black text-slate-900 sm:text-base">
                {total.toLocaleString('fa-IR')} رژیم
              </h2>
            </div>

            <div className="flex w-full items-center gap-2 sm:w-auto">
              <span className="hidden text-xs text-slate-400 md:block">
                مرتب‌سازی:
              </span>

              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="h-11 flex-1 rounded-xl border-slate-200 bg-[#FFFDFC] text-xs shadow-none hover:border-orange-200 focus:ring-4 focus:ring-orange-100 sm:w-[210px] sm:flex-none">
                  <SelectValue placeholder="مرتب‌سازی">
                    {sortLabels[sortBy] || 'مرتب‌سازی'}
                  </SelectValue>
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="date">جدیدترین</SelectItem>
                  <SelectItem value="popularity">محبوب‌ترین</SelectItem>
                  <SelectItem value="price-asc">ارزان‌ترین</SelectItem>
                  <SelectItem value="price-desc">گران‌ترین</SelectItem>
                  <SelectItem value="rating">بالاترین امتیاز</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-10">
            <EmptyState />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
              {products.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  priority={currentPage === 1 && index < 4}
                />
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              searchParams={new URLSearchParams(searchParams.toString())}
            />
          </>
        )}
      </div>

      {/* Mobile categories */}
      <Sheet
        open={mobileCategoriesOpen}
        onOpenChange={setMobileCategoriesOpen}
      >
        <SheetContent
          side="bottom"
          className="max-h-[78vh] rounded-t-[28px] border-t border-orange-100 p-0"
        >
          <SheetHeader className="border-b border-slate-100 px-5 py-4">
            <SheetTitle className="text-right text-base font-black">
              انتخاب دسته‌بندی
            </SheetTitle>
          </SheetHeader>

          <div className="no-scrollbar grid grid-cols-2 gap-2 overflow-y-auto p-4">
            {[
              { id: null, label: 'همه رژیم‌ها' },
              ...categories.map((category) => ({
                id: category.id,
                label: category.name,
              })),
            ].map((item) => {
              const active = selectedCategory === item.id;

              return (
                <button
                  key={item.id ?? 'all'}
                  type="button"
                  onClick={() => {
                    handleCategoryChange(item.id);
                    setMobileCategoriesOpen(false);
                  }}
                  className={[
                    'rounded-2xl border p-3.5 text-right text-sm font-bold transition',
                    active
                      ? 'border-[var(--brand-orange-dark)] bg-[var(--brand-orange)]/10 text-[var(--brand-orange-dark)]'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-orange-200 hover:bg-[#FFF8F2]',
                  ].join(' ')}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </main>
  );
}