import type { ProductSummary } from '@/types/product';
import { AutoScrollProducts } from './auto-scroll-products';
import { SectionHeading } from './section-heading';

interface ProductShowcaseSectionProps {
  products: ProductSummary[];
  onAdded?: (product: ProductSummary) => void;
}

export function ProductShowcaseSection({
  products,
  onAdded,
}: ProductShowcaseSectionProps) {
  if (!products?.length) {
    return null;
  }

  return (
    <section className="relative overflow-hidden bg-white py-12 sm:py-14 md:py-20">
      <div aria-hidden="true" className="pointer-events-none absolute right-0 top-1/3 h-80 w-48 rounded-full bg-orange-50/70 blur-3xl" />

      <div className="container relative">
        <SectionHeading
          eyebrow="انتخاب بعدی تو"
          title="رژیم مناسب خودت را پیدا کن"
          description="چند انتخاب دیگر که شاید دقیقاً مناسب سبک و هدف تو باشند."
          href="/shop"
          linkText="مشاهده همه رژیم‌ها"
        />

        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-white via-white/90 to-transparent sm:w-16" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-white via-white/90 to-transparent sm:w-16" />

          <AutoScrollProducts
            products={products.slice(0, 8)}
            visual="image"
            compact
            onAdded={onAdded}
          />
        </div>
      </div>
    </section>
  );
}
