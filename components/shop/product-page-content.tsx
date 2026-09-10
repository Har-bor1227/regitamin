'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Check,
  Heart,
  Minus,
  Package,
  Plus,
  Share2,
  ShieldCheck,
  ShoppingCart,
  Star,
  Truck,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { ProductGallery } from '@/components/shop/product-gallery';

import { useCart } from '@/providers/cart-provider';
import { useWishlist } from '@/providers/wishlist-provider';

import type {
  Product,
  ProductSummary,
  ProductVariation,
} from '@/types/product';

const brandOrange = 'var(--brand-orange)';
const brandDark = 'var(--brand-orange-dark)';

function formatPrice(value?: string | number | null) {
  const numeric = Number(value || 0);
  return numeric ? numeric.toLocaleString('fa-IR') : '۰';
}

function getDiscountPercent(
  regularPrice?: string | number | null,
  salePrice?: string | number | null,
) {
  const regular = Number(regularPrice || 0);
  const sale = Number(salePrice || 0);

  return regular > 0 && sale > 0 && sale < regular
    ? Math.round(((regular - sale) / regular) * 100)
    : 0;
}

function RelatedProductCard({ product }: { product: ProductSummary }) {
  const discount = getDiscountPercent(product.regularPrice, product.salePrice);
  const price = Number(product.salePrice || product.price || 0);

  return (
    <article className="group overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-[0_18px_42px_rgba(30,35,25,.08)]">
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-[#FFF8F2]">
          {product.images?.[0] ? (
            <Image
              src={product.images[0].src}
              alt={product.images[0].alt || product.name}
              fill
              sizes="(max-width: 640px) 44vw, (max-width: 1024px) 25vw, 250px"
              className="object-contain p-4 transition duration-500 group-hover:scale-[1.05] sm:p-5"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Package className="h-9 w-9 text-[var(--brand-orange-dark)]/20" />
            </div>
          )}

          {discount > 0 && (
            <span className="absolute right-3 top-3 rounded-full bg-[var(--brand-orange-dark)] px-2.5 py-1.5 text-[10px] font-black text-white">
              {discount}٪ تخفیف
            </span>
          )}
        </div>

        <div className="p-4">
          <h3 className="line-clamp-2 min-h-[48px] text-sm font-black leading-6 text-slate-900 transition group-hover:text-[var(--brand-orange-dark)]">
            {product.name}
          </h3>

          <div className="mt-4 flex items-end gap-2">
            <strong className="text-lg font-black text-[var(--brand-orange-dark)]">
              {formatPrice(price)}
            </strong>
            <span className="pb-1 text-[10px] text-muted-foreground">
              تومان
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}

function ProductRating({
  rating,
  count,
}: {
  rating?: string | number;
  count?: number;
}) {
  const numericRating = Number(rating || 0);

  if (!numericRating) {
    return (
      <span className="text-xs text-muted-foreground">
        هنوز امتیازی ثبت نشده
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }, (_, index) => (
          <Star
            key={index}
            className={[
              'h-4 w-4',
              index < Math.round(numericRating)
                ? 'fill-amber-400 text-amber-400'
                : 'text-slate-200',
            ].join(' ')}
          />
        ))}
      </div>

      <span className="text-xs font-bold text-slate-700">
        {numericRating.toLocaleString('fa-IR')}
      </span>

      {count !== undefined && (
        <span className="text-xs text-muted-foreground">
          ({count.toLocaleString('fa-IR')} نظر)
        </span>
      )}
    </div>
  );
}

function TrustFeatures() {
  const items = [
    {
      icon: ShieldCheck,
      title: 'پرداخت امن',
      description: 'فرآیند خرید مطمئن',
    },
    {
      icon: Truck,
      title: 'ارسال سریع',
      description: 'پیگیری سفارش',
    },
    {
      icon: Check,
      title: 'انتخاب آگاهانه',
      description: 'اطلاعات کامل محصول',
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.title}
            className="rounded-2xl border border-slate-200/80 bg-[#FFFDFC] p-3 text-center sm:p-4"
          >
            <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--brand-orange)]/10 text-[var(--brand-orange-dark)]">
              <Icon className="h-4 w-4" />
            </div>

            <p className="mt-2 text-[10px] font-black text-slate-800 sm:text-xs">
              {item.title}
            </p>

            <p className="mt-1 hidden text-[9px] leading-4 text-muted-foreground sm:block">
              {item.description}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function ProductPrice({
  price,
  regularPrice,
  isOnSale,
  discountPercent,
}: {
  price: string;
  regularPrice?: string;
  isOnSale: boolean;
  discountPercent: number;
}) {
  return (
    <div className="rounded-[24px] border border-[var(--brand-orange)]/15 bg-[var(--brand-orange)]/[0.045] p-4 sm:p-5">
      <div className="flex flex-wrap items-end gap-2">
        <strong className="text-3xl font-black tracking-tight text-[var(--brand-orange-dark)] sm:text-4xl">
          {formatPrice(price)}
        </strong>

        <span className="pb-1 text-xs text-muted-foreground">تومان</span>

        {isOnSale && regularPrice && (
          <del className="mr-2 pb-1 text-sm text-muted-foreground">
            {formatPrice(regularPrice)}
          </del>
        )}
      </div>

      {isOnSale && discountPercent > 0 && (
        <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-[var(--brand-orange-dark)]/10 px-3 py-1.5 text-[10px] font-black text-[var(--brand-orange-dark)]">
          {discountPercent}٪ تخفیف ویژه
        </div>
      )}
    </div>
  );
}

interface ProductPageContentProps {
  product: Product;
  relatedProducts?: ProductSummary[];
}

export default function ProductPageContent({
  product,
  relatedProducts = [],
}: ProductPageContentProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedAttributes, setSelectedAttributes] =
    useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'description' | 'attributes'>(
    'description',
  );
  const [shareMessage, setShareMessage] = useState('');
  const [showMobileBar, setShowMobileBar] = useState(true);

  const { addItem } = useCart();
  const {
    addItem: addToWishlist,
    removeItem: removeFromWishlist,
    isInWishlist,
  } = useWishlist();

  const isFavorite = isInWishlist(product.id);

  const variationAttributes = product.attributes.filter(
    (attribute) => attribute.variation,
  );

  const allVariationOptionsSelected = variationAttributes.every(
    (attribute) => Boolean(selectedAttributes[attribute.name]),
  );

  const currentVariation: ProductVariation | null = useMemo(() => {
    if (!product.variations?.length || !allVariationOptionsSelected) {
      return null;
    }

    return (
      product.variations.find((variation) =>
        variation.attributes.every(
          (attribute) =>
            selectedAttributes[attribute.name] === attribute.option,
        ),
      ) || null
    );
  }, [
    allVariationOptionsSelected,
    product.variations,
    selectedAttributes,
  ]);

  const isVariableProduct = variationAttributes.length > 0;
  const requiresVariation = isVariableProduct && !currentVariation;

  const displayPrice =
    currentVariation?.salePrice ||
    currentVariation?.price ||
    product.salePrice ||
    product.price;

  const displayRegularPrice = currentVariation?.onSale
    ? currentVariation.regularPrice
    : product.onSale
      ? product.regularPrice
      : '';

  const isOnSale = currentVariation
    ? currentVariation.onSale
    : product.onSale;

  const discountPercent = isOnSale
    ? getDiscountPercent(displayRegularPrice, displayPrice)
    : 0;

  const activeSku = currentVariation?.sku || product.sku;

  const activeStock = currentVariation
    ? currentVariation.stockQuantity
    : product.stockQuantity;

  const inStock = currentVariation
    ? currentVariation.inStock
    : true;

  const maxQuantity =
    activeStock !== null && activeStock !== undefined && activeStock > 0
      ? activeStock
      : undefined;

  useEffect(() => {
    const handleScroll = () => {
      const nearBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 500;

      setShowMobileBar(!nearBottom);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const selectAttribute = (name: string, option: string) => {
    setSelectedAttributes((previous) => ({
      ...previous,
      [name]: option,
    }));
  };

  const handleQuantityIncrease = () => {
    setQuantity((previous) =>
      maxQuantity && previous >= maxQuantity ? previous : previous + 1,
    );
  };

  const handleQuantityDecrease = () => {
    setQuantity((previous) => Math.max(1, previous - 1));
  };

  const canAddToCart = inStock && !requiresVariation;

  const handleAddToCart = () => {
    if (!canAddToCart) return;

    addItem({
      id: currentVariation?.id || product.id,
      name: product.name,
      slug: product.slug,
      price: displayPrice,
      quantity,
      image: currentVariation?.image?.src || product.images?.[0]?.src,
      variationId: currentVariation?.id,
      attributes: currentVariation?.attributes,
    });
  };

  const toggleWishlist = () => {
    isFavorite ? removeFromWishlist(product.id) : addToWishlist(product.id);
  };

  const handleShare = async () => {
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: product.name,
          text: `مشاهده ${product.name} در رژیتامین`,
          url,
        });
        return;
      }

      await navigator.clipboard.writeText(url);
      setShareMessage('لینک کپی شد');
      window.setTimeout(() => setShareMessage(''), 1800);
    } catch {
      // User cancelled share.
    }
  };

  return (
    <main className="min-h-screen bg-[#FCFDFC]">
      {/* Breadcrumb */}
      <div className="border-b border-border bg-white">
        <div className="container py-3.5 sm:py-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">خانه</BreadcrumbLink>
              </BreadcrumbItem>

              <BreadcrumbSeparator />

              <BreadcrumbItem>
                <BreadcrumbLink href="/shop">رژیم‌ها</BreadcrumbLink>
              </BreadcrumbItem>

              <BreadcrumbSeparator />

              <BreadcrumbItem>
                <BreadcrumbPage className="max-w-[200px] truncate sm:max-w-none">
                  {product.name}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* Product */}
      <div className="container py-5 pb-32 sm:py-7 md:py-10 md:pb-14">
        <div className="grid gap-7 lg:grid-cols-[1fr_.9fr] lg:items-start lg:gap-12 xl:gap-16">
          {/* Gallery */}
          <section className="min-w-0">
            <div className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white p-3 shadow-[0_10px_36px_rgba(30,35,25,.05)] sm:p-5">
              <ProductGallery images={product.images} />
            </div>
          </section>

          {/* Info */}
          <section className="min-w-0">
            <div className="space-y-5">
              <div className="flex flex-wrap gap-2">
                {product.categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/shop?category=${category.id}`}
                    className="rounded-full bg-[var(--brand-orange)]/10 px-3 py-1.5 text-[10px] font-bold text-[var(--brand-orange-dark)] transition hover:bg-[var(--brand-orange)]/15"
                  >
                    {category.name}
                  </Link>
                ))}

                {isOnSale && discountPercent > 0 && (
                  <Badge className="rounded-full border-0 bg-[var(--brand-orange-dark)] px-3 py-1.5 text-[10px] font-black text-white hover:bg-[var(--brand-orange-dark)]">
                    {discountPercent}٪ تخفیف
                  </Badge>
                )}
              </div>

              <div>
                <h1 className="text-2xl font-black leading-[1.4] tracking-tight text-slate-900 sm:text-3xl md:text-4xl">
                  {product.name}
                </h1>

                <div className="mt-3 flex flex-wrap items-center gap-3 sm:mt-4 sm:gap-4">
                  <ProductRating
                    rating={product.averageRating}
                    count={product.ratingCount}
                  />

                  {activeSku && (
                    <>
                      <span className="h-1 w-1 rounded-full bg-slate-300" />
                      <span className="text-[11px] text-muted-foreground sm:text-xs">
                        کد:
                        <span className="mr-1 font-mono font-semibold text-slate-700">
                          {activeSku}
                        </span>
                      </span>
                    </>
                  )}
                </div>
              </div>

              {product.shortDescription && (
                <div
                  className="text-sm leading-8 text-slate-600 [&_p]:mb-2 [&_strong]:font-bold [&_strong]:text-slate-800"
                  dangerouslySetInnerHTML={{
                    __html: product.shortDescription,
                  }}
                />
              )}

              <ProductPrice
                price={displayPrice}
                regularPrice={displayRegularPrice}
                isOnSale={isOnSale}
                discountPercent={discountPercent}
              />

              {variationAttributes.length > 0 && (
                <div className="space-y-5 rounded-[24px] border border-slate-200/80 bg-white p-5 sm:p-6">
                  <div>
                    <h2 className="text-sm font-black text-slate-900">
                      انتخاب گزینه‌ها
                    </h2>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      گزینه موردنظر خودت را انتخاب کن.
                    </p>
                  </div>

                  {variationAttributes.map((attribute) => (
                    <div key={attribute.id}>
                      <div className="mb-2.5 flex items-center justify-between gap-3">
                        <span className="text-xs font-bold text-slate-700">
                          {attribute.name}
                        </span>

                        {selectedAttributes[attribute.name] && (
                          <span className="text-[10px] font-semibold text-[var(--brand-orange-dark)]">
                            {selectedAttributes[attribute.name]}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {attribute.options.map((option) => {
                          const selected =
                            selectedAttributes[attribute.name] === option;

                          return (
                            <button
                              key={option}
                              type="button"
                              onClick={() =>
                                selectAttribute(attribute.name, option)
                              }
                              className={[
                                'rounded-xl border px-4 py-2.5 text-xs font-bold transition',
                                selected
                                  ? 'border-[var(--brand-orange-dark)] bg-[var(--brand-orange-dark)] text-white shadow-sm'
                                  : 'border-slate-200 bg-white text-slate-600 hover:border-orange-200 hover:text-[var(--brand-orange-dark)]',
                              ].join(' ')}
                            >
                              {option}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {requiresVariation && (
                    <div className="rounded-xl bg-amber-50 px-4 py-3 text-xs font-bold text-amber-700">
                      لطفاً همه گزینه‌ها را انتخاب کنید.
                    </div>
                  )}
                </div>
              )}

              <div
                className={[
                  'flex items-center justify-between rounded-2xl border px-4 py-3',
                  inStock
                    ? 'border-emerald-100 bg-emerald-50/70'
                    : 'border-red-100 bg-red-50/70',
                ].join(' ')}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={[
                      'h-2.5 w-2.5 rounded-full',
                      inStock ? 'bg-emerald-500' : 'bg-red-500',
                    ].join(' ')}
                  />

                  <span
                    className={[
                      'text-xs font-bold',
                      inStock ? 'text-emerald-700' : 'text-red-600',
                    ].join(' ')}
                  >
                    {inStock
                      ? activeStock !== null && activeStock !== undefined
                        ? `${activeStock.toLocaleString('fa-IR')} عدد موجود`
                        : 'موجود'
                      : 'ناموجود'}
                  </span>
                </div>

                {inStock && (
                  <span className="text-[10px] text-emerald-600">
                    آماده ثبت سفارش
                  </span>
                )}
              </div>

              <Separator />

              <div className="rounded-[24px] border border-slate-200/80 bg-white p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="flex h-12 shrink-0 items-center rounded-xl border border-slate-200 bg-slate-50">
                    <button
                      type="button"
                      onClick={handleQuantityIncrease}
                      aria-label="افزایش تعداد"
                      disabled={
                        !inStock ||
                        Boolean(maxQuantity && quantity >= maxQuantity)
                      }
                      className="flex h-12 w-11 items-center justify-center text-slate-600 transition hover:text-[var(--brand-orange-dark)] disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <Plus className="h-4 w-4" />
                    </button>

                    <span className="w-10 text-center text-sm font-black tabular-nums">
                      {quantity.toLocaleString('fa-IR')}
                    </span>

                    <button
                      type="button"
                      onClick={handleQuantityDecrease}
                      disabled={quantity <= 1}
                      aria-label="کاهش تعداد"
                      className="flex h-12 w-11 items-center justify-center text-slate-600 transition hover:text-[var(--brand-orange-dark)] disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={!canAddToCart}
                    className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--brand-orange-dark)] px-5 text-sm font-black text-white shadow-[0_10px_24px_rgba(225,76,43,.16)] transition hover:-translate-y-0.5 hover:bg-[#d94324] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    {!inStock
                      ? 'ناموجود'
                      : requiresVariation
                        ? 'انتخاب گزینه‌ها'
                        : 'افزودن به سبد خرید'}
                  </button>

                  <button
                    type="button"
                    onClick={toggleWishlist}
                    aria-label={
                      isFavorite
                        ? 'حذف از علاقه‌مندی‌ها'
                        : 'افزودن به علاقه‌مندی‌ها'
                    }
                    className={[
                      'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border transition',
                      isFavorite
                        ? 'border-[var(--brand-orange-dark)]/20 bg-[var(--brand-orange-dark)]/5 text-[var(--brand-orange-dark)]'
                        : 'border-slate-200 bg-white text-slate-500 hover:border-orange-200 hover:text-[var(--brand-orange-dark)]',
                    ].join(' ')}
                  >
                    <Heart
                      className={
                        isFavorite
                          ? 'h-5 w-5 fill-current'
                          : 'h-5 w-5'
                      }
                    />
                  </button>

                  <button
                    type="button"
                    onClick={handleShare}
                    aria-label="اشتراک‌گذاری محصول"
                    className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-orange-200 hover:text-[var(--brand-orange-dark)]"
                  >
                    <Share2 className="h-5 w-5" />

                    {shareMessage && (
                      <span className="absolute bottom-full right-0 mb-2 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-[10px] font-bold text-white">
                        {shareMessage}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              <TrustFeatures />
            </div>
          </section>
        </div>

        {/* Details */}
        <section className="mt-10 md:mt-14">
          <div className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-sm">
            <div className="flex overflow-x-auto border-b border-border">
              <button
                type="button"
                onClick={() => setActiveTab('description')}
                className={[
                  'relative shrink-0 px-5 py-4 text-sm font-black transition sm:px-6',
                  activeTab === 'description'
                    ? 'text-[var(--brand-orange-dark)]'
                    : 'text-muted-foreground hover:text-slate-900',
                ].join(' ')}
              >
                توضیحات

                {activeTab === 'description' && (
                  <span className="absolute inset-x-4 bottom-0 h-0.5 rounded-full bg-[var(--brand-orange-dark)]" />
                )}
              </button>

              {product.attributes.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab('attributes')}
                  className={[
                    'relative shrink-0 px-5 py-4 text-sm font-black transition sm:px-6',
                    activeTab === 'attributes'
                      ? 'text-[var(--brand-orange-dark)]'
                      : 'text-muted-foreground hover:text-slate-900',
                  ].join(' ')}
                >
                  مشخصات

                  {activeTab === 'attributes' && (
                    <span className="absolute inset-x-4 bottom-0 h-0.5 rounded-full bg-[var(--brand-orange-dark)]" />
                  )}
                </button>
              )}
            </div>

            <div className="p-5 sm:p-7 md:p-9">
              {activeTab === 'description' && (
                <article
                  className="
                    prose prose-sm max-w-none text-slate-600
                    prose-headings:font-black prose-headings:text-slate-900
                    prose-p:leading-8 prose-p:text-slate-600
                    prose-a:text-[var(--brand-orange-dark)]
                    prose-strong:text-slate-900
                    prose-img:rounded-2xl prose-li:leading-8
                    md:prose-base
                  "
                  dangerouslySetInnerHTML={{
                    __html:
                      product.description ||
                      '<p>توضیحات محصول موجود نیست.</p>',
                  }}
                />
              )}

              {activeTab === 'attributes' && (
                <div className="overflow-hidden rounded-2xl border border-border">
                  {product.attributes.map((attribute, index) => (
                    <div
                      key={attribute.id}
                      className={[
                        'grid grid-cols-1 sm:grid-cols-[220px_1fr]',
                        index !== product.attributes.length - 1
                          ? 'border-b border-border'
                          : '',
                      ].join(' ')}
                    >
                      <div className="bg-slate-50 px-4 py-3 text-xs font-bold text-slate-700 sm:px-5">
                        {attribute.name}
                      </div>

                      <div className="px-4 py-3 text-xs leading-6 text-muted-foreground sm:px-5">
                        {attribute.options.join('، ')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Related */}
        {relatedProducts.length > 0 && (
          <section className="mt-10 md:mt-14">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <span className="text-xs font-black text-[var(--brand-orange-dark)]">
                  شاید این‌ها را هم بپسندی
                </span>

                <h2 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">
                  رژیم‌های مرتبط
                </h2>
              </div>

              <Link
                href="/shop"
                className="hidden items-center gap-1 text-xs font-bold text-[var(--brand-orange-dark)] sm:flex"
              >
                مشاهده همه
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </div>

            <div className="no-scrollbar flex snap-x gap-3.5 overflow-x-auto pb-3 sm:grid sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
              {relatedProducts.slice(0, 4).map((related) => (
                <div
                  key={related.id}
                  className="min-w-[250px] snap-start sm:min-w-0"
                >
                  <RelatedProductCard product={related} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Mobile purchase bar */}
      {showMobileBar && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white/95 p-3 shadow-[0_-10px_35px_rgba(15,23,42,.08)] backdrop-blur md:hidden">
          <div className="mx-auto flex max-w-lg items-center gap-3">
            <div className="min-w-0 flex-1">
              <span className="block text-[10px] text-muted-foreground">
                قیمت
              </span>

              <strong className="mt-0.5 block truncate text-lg font-black text-[var(--brand-orange-dark)]">
                {formatPrice(displayPrice)}{' '}
                <span className="text-[9px] text-muted-foreground">
                  تومان
                </span>
              </strong>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!canAddToCart}
              className="flex h-12 flex-[1.5] items-center justify-center gap-2 rounded-xl bg-[var(--brand-orange-dark)] px-4 text-xs font-black text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ShoppingCart className="h-4 w-4" />
              {!inStock
                ? 'ناموجود'
                : requiresVariation
                  ? 'انتخاب گزینه'
                  : 'افزودن به سبد'}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}