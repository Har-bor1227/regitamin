'use client';

import { useEffect, useRef } from 'react';
import type { ProductSummary } from '@/types/product';
import { DietCard } from './diet-card';

interface AutoScrollProductsProps {
  products: ProductSummary[];
  visual?: 'icon' | 'image';
  compact?: boolean;
  onAdded?: (product: ProductSummary) => void;
}

export function AutoScrollProducts({
  products,
  visual = 'icon',
  compact = false,
  onAdded,
}: AutoScrollProductsProps) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPausedRef = useRef(false);

  useEffect(() => {
    const viewport = viewportRef.current;

    if (!viewport || products.length < 2) {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    if (prefersReducedMotion) {
      return;
    }

    const speed = visual === 'image' ? 0.42 : 0.5;

    const tick = () => {
      if (!isPausedRef.current) {
        viewport.scrollLeft += speed;

        const half = viewport.scrollWidth / 2;

        if (viewport.scrollLeft >= half) {
          viewport.scrollLeft -= half;
        }
      }

      animationRef.current = window.requestAnimationFrame(tick);
    };

    animationRef.current = window.requestAnimationFrame(tick);

    return () => {
      if (animationRef.current) {
        window.cancelAnimationFrame(animationRef.current);
      }

      if (resumeTimeoutRef.current) {
        clearTimeout(resumeTimeoutRef.current);
      }
    };
  }, [products.length, visual]);

  const pause = () => {
    isPausedRef.current = true;

    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
    }
  };

  const resume = () => {
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
    }

    resumeTimeoutRef.current = setTimeout(() => {
      isPausedRef.current = false;
    }, 900);
  };

  return (
    <div
      ref={viewportRef}
      dir="ltr"
      onMouseEnter={pause}
      onMouseLeave={resume}
      onPointerDown={pause}
      onPointerUp={resume}
      onTouchStart={pause}
      onTouchEnd={resume}
      className="no-scrollbar overflow-x-auto scroll-smooth pb-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <div className="flex w-max gap-3.5 pr-1 sm:gap-4">
        {[...products, ...products].map((product, index) => (
          <DietCard
            key={`${product.id}-${index}`}
            product={product}
            compact={compact}
            visual={visual}
            iconIndex={index}
            onAdded={onAdded}
          />
        ))}
      </div>
    </div>
  );
}
