'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  DollarSign,
  Search,
  SlidersHorizontal,
  Tag,
  X,
} from 'lucide-react';
import Slider from 'rc-slider';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import 'rc-slider/assets/index.css';

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface ShopFiltersProps {
  categories: Category[];
  initialSearch?: string;
  initialMinPrice?: number;
  initialMaxPrice?: number;
  initialCategory?: number | null;
  priceRange: [number, number];
}

const brandDark = 'var(--brand-orange-dark)';

export function ShopFilters({
  categories,
  initialSearch = '',
  initialMinPrice,
  initialMaxPrice,
  initialCategory,
  priceRange,
}: ShopFiltersProps) {
  const router = useRouter();

  const [search, setSearch] = useState(initialSearch);
  const [price, setPrice] = useState<[number, number]>([
    initialMinPrice ?? priceRange[0],
    initialMaxPrice ?? priceRange[1],
  ]);
  const [selectedCategory, setSelectedCategory] =
    useState<number | null>(initialCategory ?? null);

  const hasPriceFilter =
    price[0] !== priceRange[0] || price[1] !== priceRange[1];

  const activeFiltersCount =
    Number(Boolean(search.trim())) +
    Number(selectedCategory !== null) +
    Number(hasPriceFilter);

  const resetFilters = () => {
    setSearch('');
    setPrice(priceRange);
    setSelectedCategory(null);
    router.push('/shop');
  };

  const applyFilters = () => {
    const params = new URLSearchParams();

    if (search.trim()) {
      params.set('search', search.trim());
    }

    if (selectedCategory !== null) {
      params.set('category', String(selectedCategory));
    }

    if (price[0] !== priceRange[0]) {
      params.set('min_price', String(price[0]));
    }

    if (price[1] !== priceRange[1]) {
      params.set('max_price', String(price[1]));
    }

    const query = params.toString();
    router.push(query ? `/shop?${query}` : '/shop');
  };

  const handlePriceChange = (value: number | number[]) => {
    if (Array.isArray(value) && value.length === 2) {
      setPrice([value[0], value[1]]);
    }
  };

  return (
    <aside className="sticky top-24 rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-[0_8px_28px_rgba(30,35,25,.05)]">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--brand-orange)]/10 text-[var(--brand-orange-dark)]">
            <SlidersHorizontal className="h-4 w-4" />
          </span>

          <div>
            <h2 className="text-sm font-black text-slate-900">
              فیلترها
            </h2>

            {activeFiltersCount > 0 && (
              <div className="mt-0.5">
                <Badge className="h-5 rounded-full bg-[var(--brand-orange-dark)] px-2 text-[9px] font-black text-white">
                  {activeFiltersCount} فیلتر فعال
                </Badge>
              </div>
            )}
          </div>
        </div>

        {activeFiltersCount > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="h-8 rounded-lg px-2.5 text-[11px] text-slate-500 hover:bg-orange-50 hover:text-[var(--brand-orange-dark)]"
          >
            <X className="ml-1 h-3.5 w-3.5" />
            حذف همه
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="mt-6">
        <label
          htmlFor="shop-filter-search"
          className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-700"
        >
          <Search className="h-3.5 w-3.5 text-[var(--brand-orange-dark)]" />
          جستجو
        </label>

        <div className="relative">
          <Search className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <Input
            id="shop-filter-search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="نام محصول..."
            className="h-11 rounded-xl border-slate-200 bg-slate-50/60 pr-10 text-sm shadow-none focus:border-[var(--brand-orange-dark)] focus:bg-white focus:ring-4 focus:ring-[var(--brand-orange)]/10"
          />
        </div>
      </div>

      {/* Category */}
      <div className="mt-6">
        <div className="mb-2 flex items-center gap-2">
          <Tag className="h-3.5 w-3.5 text-[var(--brand-orange-dark)]" />
          <span className="text-xs font-bold text-slate-700">
            دسته‌بندی
          </span>
        </div>

        <div className="max-h-48 space-y-1 overflow-y-auto pr-1">
          {!categories.length ? (
            <p className="px-1 py-2 text-xs text-slate-400">
              دسته‌بندی یافت نشد.
            </p>
          ) : (
            categories.map((category) => {
              const selected = selectedCategory === category.id;

              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() =>
                    setSelectedCategory(
                      selected ? null : category.id,
                    )
                  }
                  className={[
                    'w-full rounded-xl px-3 py-2.5 text-right text-xs transition',
                    selected
                      ? 'bg-[var(--brand-orange)]/10 font-black text-[var(--brand-orange-dark)]'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                  ].join(' ')}
                >
                  {category.name}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Price */}
      <div className="mt-6">
        <div className="mb-4 flex items-center gap-2">
          <DollarSign className="h-3.5 w-3.5 text-[var(--brand-orange-dark)]" />
          <span className="text-xs font-bold text-slate-700">
            محدوده قیمت
          </span>
        </div>

        <div className="px-2">
          <Slider
            range
            min={priceRange[0]}
            max={priceRange[1]}
            step={10000}
            value={price}
            onChange={handlePriceChange}
            styles={{
              track: {
                backgroundColor: brandDark,
                height: 4,
              },
              rail: {
                backgroundColor: '#e5e7eb',
                height: 4,
              },
              handle: {
                backgroundColor: '#fff',
                borderColor: brandDark,
                borderWidth: 2,
                width: 18,
                height: 18,
                marginTop: -7,
                boxShadow: '0 2px 5px rgba(0,0,0,.12)',
                opacity: 1,
              },
            }}
          />
        </div>

        <div className="mt-4 flex items-center gap-2">
          <PriceInput
            placeholder="از"
            value={price[0] === 0 ? '' : price[0]}
            onChange={(value) =>
              setPrice([
                Number(value) || 0,
                price[1],
              ])
            }
          />

          <span className="shrink-0 text-[10px] text-slate-400">
            تا
          </span>

          <PriceInput
            placeholder="تا"
            value={price[1] === priceRange[1] ? '' : price[1]}
            onChange={(value) =>
              setPrice([
                price[0],
                Number(value) || priceRange[1],
              ])
            }
          />
        </div>
      </div>

      {/* Apply */}
      <Button
        type="button"
        onClick={applyFilters}
        className="mt-6 h-12 w-full rounded-xl bg-[var(--brand-orange-dark)] text-sm font-black text-white shadow-[0_10px_22px_rgba(225,76,43,.14)] transition hover:-translate-y-0.5 hover:bg-[#d94324] hover:shadow-[0_14px_28px_rgba(225,76,43,.18)]"
      >
        <Search className="ml-2 h-4 w-4" />
        اعمال فیلترها
      </Button>
    </aside>
  );
}

function PriceInput({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string;
  value: number | string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative min-w-0 flex-1">
      <Input
        type="number"
        inputMode="numeric"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-xl border-slate-200 bg-slate-50/50 pl-12 text-xs shadow-none focus:border-[var(--brand-orange-dark)] focus:bg-white focus:ring-4 focus:ring-[var(--brand-orange)]/10"
      />

      <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[9px] text-slate-400">
        تومان
      </span>
    </div>
  );
}