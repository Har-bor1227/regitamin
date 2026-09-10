import Link from 'next/link';

import {
  ArrowLeft,
  Award,
  CheckCircle2,
  Heart,
  Leaf,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
} from 'lucide-react';

interface AboutPageContentProps {
  title: string;
  content: string;
}

const values = [
  {
    icon: Target,
    title: 'هدف‌محوری',
    description:
      'تلاش می‌کنیم تجربه و خدمات رژیتامین در مسیر نیاز واقعی کاربران طراحی شود.',
  },
  {
    icon: ShieldCheck,
    title: 'اعتماد و شفافیت',
    description:
      'اطلاعات روشن و تجربه خرید قابل اعتماد، بخش مهمی از رابطه ما با مشتریان است.',
  },
  {
    icon: Heart,
    title: 'مشتری‌مداری',
    description:
      'هدف ما ایجاد تجربه‌ای ساده، محترمانه و کاربردی برای هر کاربر است.',
  },
  {
    icon: Award,
    title: 'کیفیت',
    description:
      'در انتخاب محصولات و ساخت تجربه دیجیتال، کیفیت را یک اصل اساسی می‌دانیم.',
  },
];

export default function AboutPageContent({
  title,
  content,
}: AboutPageContentProps) {
  return (
    <main className="min-h-screen bg-[#fafcf9]">
      <section className="relative overflow-hidden border-b border-border bg-[#edf5ef]">
        <div
          aria-hidden="true"
          className="absolute -right-28 -top-28 h-72 w-72 rounded-full bg-primary/10 blur-3xl"
        />

        <div
          aria-hidden="true"
          className="absolute -bottom-36 -left-20 h-80 w-80 rounded-full bg-emerald-200/30 blur-3xl"
        />

        <div className="container relative py-14 md:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/75 px-4 py-2 text-xs font-bold text-primary shadow-sm">
              <Sparkles className="h-4 w-4" />
              درباره رژیتامین
            </span>

            <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
              {title || 'درباره رژیتامین'}
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-sm leading-8 text-slate-600 sm:text-base">
              آشنایی بیشتر با نگاه، ارزش‌ها و مسیری که رژیتامین
              برای ساختن یک تجربه بهتر دنبال می‌کند.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20">
        <div className="container">
          <div className="grid gap-8 lg:grid-cols-[1.15fr_.85fr] lg:items-start lg:gap-14">
            <article className="rounded-[30px] border border-border bg-white p-6 shadow-sm sm:p-8 md:p-10">
              <div className="mb-7 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Leaf className="h-5 w-5" />
                </div>

                <div>
                  <span className="text-[11px] font-bold text-primary">
                    داستان رژیتامین
                  </span>

                  <h2 className="mt-1 text-xl font-black">
                    درباره ما
                  </h2>
                </div>
              </div>

              <div
                className="
                  prose prose-sm max-w-none
                  text-slate-600
                  prose-headings:font-black
                  prose-headings:text-slate-900
                  prose-p:leading-8
                  prose-p:text-slate-600
                  prose-a:text-primary
                  prose-strong:text-slate-900
                  prose-img:rounded-2xl
                  md:prose-base
                "
                dangerouslySetInnerHTML={{
                  __html: content,
                }}
              />
            </article>

            <aside className="lg:sticky lg:top-24">
              <div className="overflow-hidden rounded-[30px] bg-slate-950 p-6 text-white shadow-[0_25px_70px_rgba(15,30,25,0.12)] sm:p-8">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                  <Heart className="h-7 w-7" />
                </div>

                <h2 className="mt-6 text-2xl font-black leading-tight">
                  همراه مسیر انتخاب بهتر
                </h2>

                <p className="mt-4 text-sm leading-7 text-white/60">
                  رژیتامین تلاش می‌کند مسیر پیدا کردن محصول و
                  رژیم مناسب را ساده‌تر، شفاف‌تر و قابل‌اعتمادتر
                  کند.
                </p>

                <div className="mt-7 space-y-3">
                  {[
                    'تجربه کاربری ساده',
                    'اطلاعات قابل دسترس',
                    'خرید سریع و آسان',
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 rounded-xl bg-white/[0.04] px-3 py-3"
                    >
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />

                      <span className="text-xs font-semibold text-white/75">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>

                <Link
                  href="/shop"
                  className="mt-7 flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
                >
                  مشاهده رژیم‌ها
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-white py-14 md:py-20">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-bold text-primary">
              آنچه برای ما مهم است
            </span>

            <h2 className="mt-2 text-2xl font-black text-slate-900 md:text-3xl">
              ارزش‌های رژیتامین
            </h2>

            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              اصولی که در طراحی محصول، تجربه کاربری و ارتباط با
              مشتریان دنبال می‌کنیم.
            </p>
          </div>

          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => (
              <div
                key={value.title}
                className="group rounded-[24px] border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-[0_18px_45px_rgba(20,40,30,0.07)]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-105">
                  <value.icon className="h-6 w-6" />
                </div>

                <h3 className="mt-5 text-base font-black">
                  {value.title}
                </h3>

                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20">
        <div className="container">
          <div className="overflow-hidden rounded-[30px] bg-primary px-6 py-10 text-center text-primary-foreground shadow-[0_25px_70px_rgba(20,120,90,0.14)] sm:px-10 md:py-14">
            <div className="mx-auto max-w-2xl">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
                <Users className="h-7 w-7" />
              </div>

              <h2 className="mt-5 text-2xl font-black md:text-3xl">
                آماده‌ای مسیرت را شروع کنی؟
              </h2>

              <p className="mt-3 text-sm leading-7 text-white/75">
                رژیم‌ها و گزینه‌های موجود را بررسی کن و انتخابت را
                آگاهانه‌تر انجام بده.
              </p>

              <Link
                href="/shop"
                className="mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 text-sm font-black text-primary transition hover:bg-white/90"
              >
                مشاهده رژیم‌ها
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}