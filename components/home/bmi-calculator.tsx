'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  CalendarDays,
  Check,
  CircleGauge,
  Ruler,
  Scale,
} from 'lucide-react';

interface BmiResult {
  bmi: number;
  label: string;
  description: string;
}

export function BmiCalculator() {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [wrist, setWrist] = useState('');
  const [gender, setGender] = useState<'female' | 'male' | null>(null);
  const [hasCalculated, setHasCalculated] = useState(false);

  const result = useMemo<BmiResult | null>(() => {
    if (!hasCalculated) {
      return null;
    }

    const weightValue = Number(weight);
    const heightValue = Number(height);

    if (!weightValue || !heightValue || weightValue <= 0 || heightValue <= 0) {
      return null;
    }

    const bmi = weightValue / Math.pow(heightValue / 100, 2);
    const value = Number(bmi.toFixed(1));

    if (bmi < 18.5) {
      return {
        bmi: value,
        label: 'کمبود وزن',
        description: 'شاخص توده بدنی شما پایین‌تر از محدوده نرمال است.',
      };
    }

    if (bmi < 25) {
      return {
        bmi: value,
        label: 'وزن نرمال',
        description: 'شاخص توده بدنی شما در محدوده نرمال قرار دارد.',
      };
    }

    if (bmi < 30) {
      return {
        bmi: value,
        label: 'اضافه وزن',
        description: 'شاخص توده بدنی شما در محدوده اضافه وزن قرار دارد.',
      };
    }

    return {
      bmi: value,
      label: 'چاقی',
      description: 'شاخص توده بدنی شما در محدوده چاقی قرار دارد.',
    };
  }, [weight, height, hasCalculated]);

  const inputClass =
    'h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-[var(--brand-orange-dark)] focus:ring-4 focus:ring-[var(--brand-orange)]/10';

  const handleWeightChange = (value: string) => {
    setWeight(value);

    if (hasCalculated) {
      setHasCalculated(false);
    }
  };

  const handleHeightChange = (value: string) => {
    setHeight(value);

    if (hasCalculated) {
      setHasCalculated(false);
    }
  };

  const handleCalculate = () => {
    setHasCalculated(true);

    window.requestAnimationFrame(() => {
      document.getElementById('bmi-result')?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    });
  };

  return (
    <section
      id="bmi"
      className="scroll-mt-24 bg-[#FFF8F3] py-12 sm:py-16 md:py-20"
    >
      <div className="container">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[34px] border border-white bg-white shadow-[0_30px_90px_rgba(30,35,25,.08)]">
          <div className="grid lg:grid-cols-[.84fr_1.16fr]">
            <div className="relative overflow-hidden bg-slate-950 p-6 text-white sm:p-9 md:p-11">
              <div aria-hidden="true" className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-[var(--brand-orange-dark)]/30 blur-3xl" />
              <div aria-hidden="true" className="absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-[var(--brand-orange)]/20 blur-3xl" />

              <div className="relative">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-black text-white/80">
                  <CircleGauge className="h-3.5 w-3.5" />
                  ابزار سلامت رژیتامین
                </div>

                <h2 className="mt-6 text-3xl font-black leading-[1.25] sm:text-4xl">
                  وضعیت وزنت
                  <span className="block text-[var(--brand-orange)]">چطور است؟</span>
                </h2>

                <p className="mt-4 max-w-md text-sm leading-8 text-white/55">
                  اطلاعاتت را وارد کن و زمانی که آماده بودی، روی دکمه محاسبه
                  بزن تا BMI نمایش داده شود.
                </p>

                <div className="mt-8 space-y-3">
                  {[
                    'محاسبه سریع و ساده',
                    'کاملاً مناسب موبایل',
                    'مناسب برای ارزیابی اولیه',
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3 text-sm">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10">
                        <Check className="h-4 w-4 text-[var(--brand-orange)]" />
                      </span>
                      <span className="text-white/75">{item}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-9 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[10px] leading-6 text-white/45">
                    BMI یک شاخص عمومی است و به‌تنهایی برای تشخیص وضعیت سلامت یا
                    تعیین رژیم درمانی کافی نیست.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-8 md:p-10">
              <div className="mb-7">
                <span className="text-[11px] font-black text-[var(--brand-orange-dark)]">
                  اطلاعات شما
                </span>
                <h3 className="mt-2 text-xl font-black text-slate-950 sm:text-2xl">
                  مشخصات بدنی را وارد کنید
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <BmiInput icon={Scale} label="وزن" value={weight} onChange={handleWeightChange} placeholder="مثلاً 72" unit="کیلوگرم" className={inputClass} />
                <BmiInput icon={Ruler} label="قد" value={height} onChange={handleHeightChange} placeholder="مثلاً 175" unit="سانتی‌متر" className={inputClass} />
                <BmiInput icon={CalendarDays} label="سن" value={age} onChange={setAge} placeholder="مثلاً 28" unit="سال" className={inputClass} />
                <BmiInput
  icon={CircleGauge}
  label="دور مچ"
  value={wrist}
  onChange={setWrist}
  placeholder="مثلاً 17"
  unit="سانتی‌متر"
  className={inputClass}
  optional
/>
              </div>

              <div className="mt-6">
                <span className="mb-3 block text-sm font-bold text-slate-700">جنسیت</span>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'female' as const, label: 'زن', symbol: '♀' },
                    { value: 'male' as const, label: 'مرد', symbol: '♂' },
                  ].map((item) => {
                    const active = gender === item.value;

                    return (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => setGender(item.value)}
                        className={[
                          'flex h-14 items-center justify-center gap-2 rounded-2xl border text-sm font-bold transition-all duration-300',
                          active
                            ? 'border-[var(--brand-orange-dark)] bg-[var(--brand-orange)]/10 text-[var(--brand-orange-dark)] shadow-sm'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-orange-200 hover:bg-orange-50/30',
                        ].join(' ')}
                      >
                        <span className="text-lg">{item.symbol}</span>
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="button"
                disabled={!weight || !height}
                onClick={handleCalculate}
                className="group mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--brand-orange-dark)] text-sm font-black text-white shadow-[0_14px_28px_rgba(225,76,43,.18)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#d94324] disabled:cursor-not-allowed disabled:opacity-40"
              >
                محاسبه BMI
                <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
              </button>

              <div
                id="bmi-result"
                className={`mt-5 min-h-[118px] rounded-[22px] border p-5 transition-all duration-500 ${
                  hasCalculated
                    ? 'border-orange-100 bg-[#FFFAF6]'
                    : 'border-slate-100 bg-slate-50/70'
                }`}
              >
                {!hasCalculated ? (
                  <div className="flex min-h-[76px] items-center justify-center text-center text-xs leading-6 text-slate-400">
                    هنوز محاسبه‌ای انجام نشده.
                    <br />
                    اطلاعات را وارد کن و روی «محاسبه BMI» بزن.
                  </div>
                ) : !result ? (
                  <div className="flex min-h-[76px] items-center justify-center text-center text-xs leading-6 text-slate-400">
                    اطلاعات واردشده برای محاسبه کافی نیست.
                  </div>
                ) : (
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400">نتیجه BMI</span>
                      <div className="mt-1 flex items-end gap-2">
                        <strong className="text-4xl font-black text-[var(--brand-orange-dark)]">
                          {result.bmi.toLocaleString('fa-IR')}
                        </strong>
                        <span className="pb-1 text-sm font-black text-slate-700">{result.label}</span>
                      </div>
                      <p className="mt-2 text-[10px] leading-6 text-slate-400">{result.description}</p>
                    </div>

                    <Link
                      href="/shop"
                      className="group inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-xs font-black text-white transition-all duration-300 hover:bg-slate-800"
                    >
                      پیدا کردن رژیم
                      <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function BmiInput({
  icon: Icon,
  label,
  value,
  onChange,
  placeholder,
  unit,
  className,
  optional = false,
}: {
  icon: typeof Scale;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  unit: string;
  className: string;
  optional?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2.5 flex items-center gap-2 text-xs font-bold text-slate-700 sm:text-sm">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-orange)]/10 text-[var(--brand-orange-dark)]">
          <Icon className="h-4 w-4" />
        </span>

        <span>{label}</span>

        {optional && (
          <span className="text-[9px] font-medium text-slate-400 sm:text-[10px]">
            (اختیاری)
          </span>
        )}
      </span>

      <div className="relative">
        <input
          type="number"
          inputMode="decimal"
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          placeholder={placeholder}
          className={`${className} pl-16 sm:pl-20`}
        />

        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[9px] font-medium text-slate-400 sm:left-4 sm:text-[10px]">
          {unit}
        </span>
      </div>
    </label>
  );
}