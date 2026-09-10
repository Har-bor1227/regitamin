'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  LazyMotion,
  domAnimation,
  m,
  AnimatePresence,
} from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
} from 'lucide-react';

import { Button } from '@/components/ui/button';

interface ProductImage {
  src: string;
  alt: string;
}

interface ProductGalleryProps {
  images: ProductImage[];
}

export function ProductGallery({
  images,
}: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  if (!images?.length) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-2xl bg-[#FFF8F2] text-sm text-muted-foreground">
        بدون تصویر
      </div>
    );
  }

  const activeImage = images[activeIndex];

  const goNext = () => {
    setIsZoomed(false);
    setActiveIndex((index) => (index + 1) % images.length);
  };

  const goPrev = () => {
    setIsZoomed(false);
    setActiveIndex(
      (index) => (index - 1 + images.length) % images.length,
    );
  };

  const toggleZoom = () => setIsZoomed((value) => !value);

  return (
    <LazyMotion features={domAnimation}>
      <div className="space-y-3 sm:space-y-4">
        {/* Main image */}
        <div className="group relative aspect-square overflow-hidden rounded-[22px] bg-[#FFF8F2]">
          <AnimatePresence mode="wait">
            <m.div
              key={activeImage.src}
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                scale: isZoomed ? 1.45 : 1,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="absolute inset-0"
            >
              <Image
                src={activeImage.src}
                alt={activeImage.alt || 'تصویر محصول'}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="cursor-zoom-in object-contain p-5 sm:p-8"
                onClick={toggleZoom}
              />
            </m.div>
          </AnimatePresence>

          {/* Zoom */}
          <Button
            type="button"
            size="icon"
            variant="secondary"
            onClick={toggleZoom}
            aria-label={isZoomed ? 'کوچک کردن تصویر' : 'بزرگنمایی تصویر'}
            className="absolute right-3 top-3 z-10 h-9 w-9 rounded-xl border border-white/80 bg-white/90 text-slate-600 opacity-100 shadow-sm backdrop-blur transition hover:text-[var(--brand-orange-dark)] sm:right-4 sm:top-4 sm:opacity-0 sm:group-hover:opacity-100"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>

          {/* Navigation */}
          {images.length > 1 && (
            <>
              <Button
                type="button"
                size="icon"
                variant="secondary"
                onClick={goPrev}
                aria-label="تصویر قبلی"
                className="absolute left-3 top-1/2 z-10 h-9 w-9 -translate-y-1/2 rounded-xl border border-white/80 bg-white/90 text-slate-600 shadow-sm backdrop-blur transition hover:text-[var(--brand-orange-dark)] sm:left-4 sm:h-10 sm:w-10"
              >
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>

              <Button
                type="button"
                size="icon"
                variant="secondary"
                onClick={goNext}
                aria-label="تصویر بعدی"
                className="absolute right-3 top-1/2 z-10 h-9 w-9 -translate-y-1/2 rounded-xl border border-white/80 bg-white/90 text-slate-600 shadow-sm backdrop-blur transition hover:text-[var(--brand-orange-dark)] sm:right-4 sm:h-10 sm:w-10"
              >
                <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>

              <div className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-slate-900/65 px-2.5 py-1 text-[9px] font-bold text-white backdrop-blur">
                {(activeIndex + 1).toLocaleString('fa-IR')} از{' '}
                {images.length.toLocaleString('fa-IR')}
              </div>
            </>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
            {images.map((image, index) => {
              const active = index === activeIndex;

              return (
                <button
                  key={`${image.src}-${index}`}
                  type="button"
                  onClick={() => {
                    setIsZoomed(false);
                    setActiveIndex(index);
                  }}
                  aria-label={`نمایش تصویر ${index + 1}`}
                  aria-current={active}
                  className={[
                    'relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 bg-[#FFF8F2] transition-all sm:h-[72px] sm:w-[72px]',
                    active
                      ? 'border-[var(--brand-orange-dark)] shadow-[0_5px_16px_rgba(225,76,43,.12)]'
                      : 'border-transparent opacity-60 hover:border-orange-200 hover:opacity-100',
                  ].join(' ')}
                >
                  <Image
                    src={image.src}
                    alt={image.alt || `تصویر ${index + 1}`}
                    fill
                    sizes="72px"
                    className="object-contain p-1.5"
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </LazyMotion>
  );
}