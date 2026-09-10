import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';

export function FinalCta() {
  return (
    <section className="pb-12 sm:pb-14 md:pb-20">
      <div className="container">
        <div className="relative overflow-hidden rounded-[34px] bg-slate-950 px-6 py-9 text-white shadow-[0_25px_65px_rgba(15,23,42,.16)] sm:px-9 md:px-12 md:py-12">
          <div aria-hidden="true" className="absolute -left-28 -top-28 h-72 w-72 rounded-full bg-[var(--brand-orange-dark)]/25 blur-3xl" />
          <div aria-hidden="true" className="absolute -bottom-36 right-0 h-72 w-72 rounded-full bg-[var(--brand-orange)]/15 blur-3xl" />

          <div className="relative grid items-center gap-8 md:grid-cols-[1fr_auto]">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-black text-white/60">
                <Sparkles className="h-3.5 w-3.5 text-[var(--brand-orange)]" />
                آماده شروع؟
              </div>

              <h2 className="mt-4 text-2xl font-black leading-tight sm:text-3xl md:text-4xl">
                رژیم مناسب خودت
                <span className="text-[var(--brand-orange)]"> همین‌جا </span>
                پیدا کن.
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-7 text-white/50">
                از بین رژیم‌های موجود گزینه مناسب را پیدا کن و قدم بعدی را بردار.
              </p>
            </div>

            <Link
              href="/shop"
              className="group inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-[var(--brand-orange-dark)] px-7 text-sm font-black text-white shadow-[0_12px_28px_rgba(225,76,43,.22)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#d94324]"
            >
              مشاهده رژیم‌ها
              <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
