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
    <section className="relative overflow-hidden bg-white py-12 sm:py-14 md:py-18">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-1/2 h-[420px] w-[220px] -translate-y-1/2 rounded-full bg-orange-50/80 blur-3xl"
      />

      <div className="container relative">
        <SectionHeading
          eyebrow="محبوب‌ترین انتخاب‌ها"
          title="رژیم‌هایی که بیشتر انتخاب شده‌اند"
          description="چند انتخاب پرطرفدار برای شروع مسیرت."
          href="/shop"
          linkText="مشاهده همه"
        />

        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-white via-white/90 to-transparent sm:w-16" />

          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-white via-white/90 to-transparent sm:w-16" />

          <AutoScrollProducts
            products={products.slice(0, 8)}
            visual="icon"
            compact
            onAdded={onAdded}
          />
        </div>

        <div className="mt-0 flex items-center justify-center gap-2 text-[9px] font-bold text-slate-400">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--brand-orange-dark)]" />
          حرکت خودکار • برای مشاهده بیشتر اسکرول کنید
        </div>
      </div>
    </section>
  );
}
