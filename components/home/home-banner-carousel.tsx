
'use client';

import Image from 'next/image';
import {
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

const banners = [
  {
    src: '/images/home/banner-01.webp',
    alt: 'رژیتامین - بنر اول',
  },
  {
    src: '/images/home/banner-02.webp',
    alt: 'رژیتامین - بنر دوم',
  },
  {
    src: '/images/home/banner-03.webp',
    alt: 'رژیتامین - بنر سوم',
  },
  {
    src: '/images/home/banner-04.webp',
    alt: 'رژیتامین - بنر چهارم',
  },
] as const;

const AUTOPLAY_DELAY = 5000;
const SWIPE_THRESHOLD = 45;

export default function HomeBannerCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const touchCurrentX = useRef<number | null>(null);

  const next = useCallback(() => {
    setActiveIndex(
      (current) => (current + 1) % banners.length,
    );
  }, []);

  const previous = useCallback(() => {
    setActiveIndex(
      (current) =>
        (current - 1 + banners.length) % banners.length,
    );
  }, []);

  const goTo = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  useEffect(() => {
    if (isPaused) {
      return;
    }

    const timer = window.setInterval(
      next,
      AUTOPLAY_DELAY,
    );

    return () => {
      window.clearInterval(timer);
    };
  }, [isPaused, next]);

  const handleTouchStart = (
    event: React.TouchEvent,
  ) => {
    touchStartX.current =
      event.touches[0]?.clientX ?? null;

    touchCurrentX.current =
      touchStartX.current;
  };

  const handleTouchMove = (
    event: React.TouchEvent,
  ) => {
    touchCurrentX.current =
      event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = () => {
    const start = touchStartX.current;
    const current = touchCurrentX.current;

    if (start === null || current === null) {
      return;
    }

    const distance = start - current;

    if (Math.abs(distance) >= SWIPE_THRESHOLD) {
      if (distance > 0) {
        next();
      } else {
        previous();
      }
    }

    touchStartX.current = null;
    touchCurrentX.current = null;
  };

  const handleTouchCancel = () => {
    touchStartX.current = null;
    touchCurrentX.current = null;
  };

  return (
    <section
      aria-label="بنرهای ویژه رژیتامین"
      className="relative bg-white py-2.5 sm:py-5 md:py-7"
    >
      <div className="container">
        <div
          className={[
            'group relative overflow-hidden',
            'rounded-[22px]',
            'border border-slate-200/70',
            'bg-slate-100',
            'shadow-[0_16px_45px_rgba(30,35,25,.08)]',
            'sm:rounded-[30px]',
            'sm:shadow-[0_18px_50px_rgba(30,35,25,.08)]',
            'md:rounded-[34px]',
          ].join(' ')}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocus={() => setIsPaused(true)}
          onBlur={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchCancel}
        >
          <div
            className={[
              'relative w-full overflow-hidden',
              'aspect-[1.55]',
              'sm:aspect-[16/6.5]',
              'md:aspect-[16/6]',
              'lg:aspect-[16/5.8]',
            ].join(' ')}
            dir="ltr"
          >
            {banners.map((banner, index) => {
              const active =
                index === activeIndex;

              return (
                <div
                  key={banner.src}
                  className={[
                    'absolute inset-0 transition-all duration-700 ease-out',
                    active
                      ? 'z-[2] translate-x-0 opacity-100'
                      : 'pointer-events-none z-[1] translate-x-[2%] opacity-0',
                  ].join(' ')}
                  aria-hidden={!active}
                >
                  <Image
                    src={banner.src}
                    alt={banner.alt}
                    fill
                    priority={index === 0}
                    sizes="100vw"
                    className="select-none object-cover object-center"
                    draggable={false}
                  />

                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent"
                  />
                </div>
              );
            })}

            {/* Previous - desktop/tablet only */}
            <button
              type="button"
              onClick={previous}
              aria-label="بنر قبلی"
              className={[
                'absolute right-3 top-1/2 z-10 hidden',
                'h-10 w-10 -translate-y-1/2',
                'items-center justify-center',
                'rounded-full',
                'border border-white/70',
                'bg-white/90 text-slate-800',
                'shadow-[0_8px_24px_rgba(15,23,42,.14)]',
                'backdrop-blur-md',
                'transition-all duration-300',
                'hover:scale-105 hover:bg-white',
                'active:scale-95',
                'sm:flex sm:right-4 sm:h-11 sm:w-11',
                'md:right-5 md:h-12 md:w-12',
              ].join(' ')}
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            {/* Next - desktop/tablet only */}
            <button
              type="button"
              onClick={next}
              aria-label="بنر بعدی"
              className={[
                'absolute left-3 top-1/2 z-10 hidden',
                'h-10 w-10 -translate-y-1/2',
                'items-center justify-center',
                'rounded-full',
                'border border-white/70',
                'bg-white/90 text-slate-800',
                'shadow-[0_8px_24px_rgba(15,23,42,.14)]',
                'backdrop-blur-md',
                'transition-all duration-300',
                'hover:scale-105 hover:bg-white',
                'active:scale-95',
                'sm:flex sm:left-4 sm:h-11 sm:w-11',
                'md:left-5 md:h-12 md:w-12',
              ].join(' ')}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            {/* Dots */}
            <div
              className={[
                'absolute bottom-3 left-1/2 z-10',
                '-translate-x-1/2',
                'flex items-center gap-1.5',
                'rounded-full',
                'border border-white/40',
                'bg-black/10',
                'px-2.5 py-2',
                'backdrop-blur-md',
                'sm:bottom-4 sm:gap-2 sm:px-3',
              ].join(' ')}
              dir="ltr"
              aria-label="انتخاب بنر"
            >
              {banners.map((banner, index) => {
                const active =
                  index === activeIndex;

                return (
                  <button
                    key={banner.src}
                    type="button"
                    onClick={() => goTo(index)}
                    aria-label={`نمایش بنر ${
                      index + 1
                    }`}
                    aria-current={
                      active ? 'true' : undefined
                    }
                    className={[
                      'h-1.5 rounded-full transition-all duration-300',
                      active
                        ? 'w-7 bg-white'
                        : 'w-1.5 bg-white/55 hover:bg-white/80',
                    ].join(' ')}
                  />
                );
              })}
            </div>

            {/* Autoplay progress */}
            <div
              className={[
                'absolute bottom-0 left-0 right-0 z-10',
                'h-0.5 bg-white/25',
              ].join(' ')}
              aria-hidden="true"
            >
              {!isPaused && (
                <div
                  key={activeIndex}
                  className={[
                    'h-full origin-left',
                    'bg-white/90',
                    'animate-[bannerProgress_5s_linear_forwards]',
                  ].join(' ')}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes bannerProgress {
          from {
            width: 0%;
          }

          to {
            width: 100%;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          @keyframes bannerProgress {
            from,
            to {
              width: 100%;
            }
          }
        }
      `}</style>
    </section>
  );
}

