'use client';

import { useEffect, useState } from 'react';
import HomeBannerCarousel from '@/components/home/home-banner-carousel';
import type { PageData } from '@/types/page';
import type { PostSummary } from '@/types/post';
import type { ProductSummary } from '@/types/product';
import { CartAddedPopup } from './cart-added-popup';
import { BmiCalculator } from './bmi-calculator';
import { DoctorSection } from './doctor-section';
import { FinalCta } from './final-cta';
import { PopularDietsSection } from './popular-diets-section';
import { ProductShowcaseSection } from './product-showcase-section';
import { BlogSection } from './blog-section';
import { WhyRegitamin } from './why-regitamin';

export interface HomePageContentProps {
  popularProducts: ProductSummary[];
  aboutPage?: PageData | null;
  recentPosts: PostSummary[];
}

export default function HomePageContent({
  popularProducts,
  aboutPage,
  recentPosts,
}: HomePageContentProps) {
  // Intentionally kept in the page component so the existing popup behavior
  // and shared onAdded flow remain exactly the same.
  void aboutPage;

  const [cartPopup, setCartPopup] = useState<{ product: ProductSummary } | null>(null);

  useEffect(() => {
    if (!cartPopup) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setCartPopup(null);
    }, 6500);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [cartPopup]);

  const handleProductAdded = (product: ProductSummary) => {
    setCartPopup({
      product,
    });
  };

  return (
    <main className="overflow-hidden bg-white">
      <HomeBannerCarousel />

      <PopularDietsSection
        products={popularProducts}
        onAdded={handleProductAdded}
      />

      <BmiCalculator />

      <WhyRegitamin />

      <DoctorSection />

      <ProductShowcaseSection
        products={popularProducts}
        onAdded={handleProductAdded}
      />

      <BlogSection posts={recentPosts} />

      <FinalCta />

      <CartAddedPopup
        data={cartPopup}
        onClose={() => setCartPopup(null)}
      />
    </main>
  );
}
