
import type { ProductSummary } from '@/types/product';
import { AutoScrollProducts } from './auto-scroll-products';
import { SectionHeading } from './section-heading';

interface PopularDietsSectionProps {
  products: ProductSummary[];
  onAdded?: (product: ProductSummary) => void;
}

export function PopularDietsSection({
  products,
  onAdded,
}: PopularDietsSectionProps) {
  if (!products?.length) {
    return null;
  }

  return (
    <section className="relative overflow-hidden bg-white py-10 sm:py-12 md:py-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-20 top-1/2 h-[360px] w-[260px] -translate-y-1/2 rounded-full bg-orange-100/70 blur-[90px]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 top-1/3 h-[280px] w-[220px] rounded-full bg-amber-100/45 blur-[90px]"
      />

      <div className="container relative">
        <SectionHeading
          eyebrow="محبوب‌ترین انتخاب‌ها"
          title="رژیم‌هایی که بیشتر انتخاب شده‌اند"
          description="چند انتخاب پرطرفدار برای شروع مسیرت."
          href="/shop"
          linkText="مشاهده همه"
        />

        <div className="relative mt-7 sm:mt-8">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-7 bg-gradient-to-r from-white via-white/85 to-transparent sm:w-12" />

          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-7 bg-gradient-to-l from-white via-white/85 to-transparent sm:w-12" />

          <AutoScrollProducts
            products={products.slice(0, 8)}
            visual="image"
            compact
            onAdded={onAdded}
          />
        </div>

        <div className="mt-2 flex items-center justify-center gap-2 text-[9px] font-bold text-slate-400 sm:text-[10px]">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--brand-orange-dark)]" />
          <span>حرکت خودکار • برای مشاهده بیشتر اسکرول کنید</span>
        </div>
      </div>
    </section>
  );
}