import { CheckCircle2, ShieldCheck, Target, UserRound } from 'lucide-react';

export function WhyRegitamin() {
  const items = [
    {
      icon: Target,
      number: '01',
      title: 'انتخاب هدف‌محور',
      description:
        'رژیم مناسب هدفت را راحت‌تر پیدا کن و مستقیم سراغ گزینه مرتبط برو.',
    },
    {
      icon: ShieldCheck,
      number: '02',
      title: 'اطلاعات شفاف',
      description:
        'قبل از خرید، اطلاعات لازم درباره رژیم و محصول را ببین و آگاهانه تصمیم بگیر.',
    },
    {
      icon: CheckCircle2,
      number: '03',
      title: 'خرید ساده',
      description:
        'از انتخاب محصول تا ثبت سفارش، مسیر خرید کوتاه و بدون پیچیدگی طراحی شده است.',
    },
    {
      icon: UserRound,
      number: '04',
      title: 'مدیریت راحت',
      description:
        'با حساب کاربری، خریدها و سفارش‌هایت را ساده‌تر مدیریت کن.',
    },
  ];

  return (
    <section className="bg-white py-12 sm:py-14 md:py-20">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-3 inline-flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-orange-dark)]" />
            <span className="text-[11px] font-black text-[var(--brand-orange-dark)]">
              چرا رژیتامین؟
            </span>
          </div>

          <h2 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl lg:text-[2.15rem]">
            برای انتخاب بهتر ساخته شده‌ایم
          </h2>

          <p className="mt-3 text-sm leading-7 text-slate-500">
            همه‌چیز باید کمک کند تصمیم درست را سریع‌تر بگیری، نه اینکه مسیرت را
            پیچیده‌تر کند.
          </p>
        </div>

<div className="mt-9 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">          {items.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
className="group relative overflow-hidden rounded-[22px] border border-slate-200/80 bg-white p-4 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:border-orange-200 hover:shadow-[0_20px_45px_rgba(30,35,25,.08)] sm:rounded-[28px] sm:p-6"              >
                <div className="absolute right-4 top-3 text-5xl font-black leading-none text-slate-50 transition-colors duration-500 group-hover:text-orange-50">
                  {item.number}
                </div>

                <div className="relative">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--brand-orange)]/10 text-[var(--brand-orange-dark)] transition-transform duration-500 group-hover:scale-105">
                    <Icon className="h-5 w-5" />
                  </div>

                  <h3 className="mt-5 text-sm font-black text-slate-950">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-xs leading-7 text-slate-500 sm:text-sm">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
