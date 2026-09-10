import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Check, ShieldCheck, Sparkles } from 'lucide-react';

export function DoctorSection() {
  return (
    <section className="relative overflow-hidden bg-[#FFFAF7] py-12 sm:py-16 md:py-20">
      <div aria-hidden="true" className="pointer-events-none absolute -left-28 top-20 h-80 w-80 rounded-full bg-orange-100/40 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-orange-50/70 blur-3xl" />

      <div className="container relative">
        <div className="mx-auto grid max-w-6xl overflow-hidden rounded-[34px] border border-white bg-white shadow-[0_30px_90px_rgba(30,35,25,.08)] lg:grid-cols-[.92fr_1.08fr]">
          <div className="relative min-h-[360px] overflow-hidden bg-[#F6ECE5] sm:min-h-[460px] lg:min-h-full">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-100/60 via-transparent to-slate-900/10" />
            <div aria-hidden="true" className="absolute -left-12 bottom-6 h-44 w-44 rounded-full bg-white/40 blur-3xl" />

            <Image
              src="/images/doctor.webp"
              alt="دکتر رژیتامین"
              fill
              sizes="(max-width: 1024px) 100vw, 46vw"
              className="object-cover object-center transition duration-700"
            />

            <div className="absolute inset-x-5 bottom-5 rounded-2xl border border-white/60 bg-white/75 p-4 shadow-lg backdrop-blur-xl sm:inset-x-7 sm:bottom-7">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white">
                  <ShieldCheck className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-[10px] font-black text-slate-950">تخصص و تجربه</p>
                  <p className="mt-0.5 text-[9px] leading-5 text-slate-500">
                    همراه مطمئن‌تر برای مسیر سلامتی شما
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative flex flex-col justify-center p-6 sm:p-9 md:p-12 lg:p-14" dir="rtl">
            <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-[var(--brand-orange)]/10 px-3 py-1.5 text-[10px] font-black text-[var(--brand-orange-dark)]">
              <Sparkles className="h-3.5 w-3.5" />
              درباره متخصص رژیتامین
            </div>

            <h2 className="max-w-xl text-2xl font-black leading-[1.4] tracking-tight text-slate-950 sm:text-3xl md:text-4xl">
              سلامتی فقط عدد روی ترازو نیست؛
              <span className="block text-[var(--brand-orange-dark)]">مسیر درست مهم‌تر است.</span>
            </h2>

            <p className="mt-5 max-w-xl text-sm leading-8 text-slate-500">
              در رژیتامین تلاش کرده‌ایم انتخاب رژیم و شروع مسیر تغذیه‌ای، ساده،
              شفاف و قابل اعتماد باشد. اینجا قرار نیست فقط یک محصول بخری؛ قرار است
              انتخابی آگاهانه‌تر برای سبک زندگی‌ات داشته باشی.
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {[
                'نگاه علمی و هدف‌محور',
                'تمرکز بر انتخاب آگاهانه',
                'توجه به سبک زندگی',
                'مسیر ساده و قابل فهم',
              ].map((item) => (
                <div key={item} className="flex items-center gap-2.5 rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-[var(--brand-orange-dark)] shadow-sm">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-xs font-bold text-slate-700">{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/about"
                className="group inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-6 text-xs font-black text-white shadow-[0_12px_28px_rgba(15,23,42,.12)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-800"
              >
                بیشتر درباره رژیتامین
                <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
              </Link>

              <Link
                href="/shop"
                className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 text-xs font-black text-slate-700 transition-all duration-300 hover:border-orange-200 hover:bg-orange-50/40 hover:text-[var(--brand-orange-dark)]"
              >
                مشاهده رژیم‌ها
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
