import Link from 'next/link';

import {
  ArrowLeft,
  Clock3,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
} from 'lucide-react';

import ScrollToTopButton from '@/components/ui/scroll-to-top-button';

interface ContactPageContentProps {
  title: string;
  content: string;
}

const CONTACT_ITEMS = [
  {
    icon: Phone,
    title: 'تماس تلفنی',
    label: 'پاسخگویی و راهنمایی',
    value: '0913 505 5775',
    href: 'tel:+989135055775',
  },
  {
    icon: MessageCircle,
    title: 'ارتباط در واتساپ',
    label: 'برای سوالات و پیگیری',
    value: 'ارسال پیام',
    href: 'https://wa.me/989135055775',
  },
  {
    icon: Clock3,
    title: 'ساعات پاسخگویی',
    label: 'شنبه تا پنجشنبه',
    value: '۹ صبح تا ۶ عصر',
    href: undefined,
  },
  {
    icon: MapPin,
    title: 'آدرس',
    label: 'موقعیت مجموعه',
    value:
      'اصفهان، شهرک صنعتی محمودآباد، خیابان ۲۸، ساختمان ماهفر',
    href: undefined,
  },
];

function ContactCard({
  icon: Icon,
  title,
  label,
  value,
  href,
}: {
  icon: typeof Phone;
  title: string;
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <div className="group h-full rounded-[26px] border border-border bg-white p-5 shadow-[0_8px_30px_rgba(20,40,30,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-[0_18px_45px_rgba(20,40,30,0.08)] sm:p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-105">
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0">
          <h2 className="text-sm font-black text-slate-900">
            {title}
          </h2>

          <p className="mt-1 text-[11px] text-muted-foreground">
            {label}
          </p>

          <p className="mt-3 text-sm font-bold leading-7 text-slate-700">
            {value}
          </p>
        </div>
      </div>

      {href && (
        <span className="mt-5 inline-flex items-center gap-1 text-xs font-bold text-primary">
          ارتباط
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
        </span>
      )}
    </div>
  );

  if (!href) {
    return content;
  }

  return (
    <a
      href={href}
      target={href.startsWith('http') ? '_blank' : undefined}
      rel={
        href.startsWith('http')
          ? 'noopener noreferrer'
          : undefined
      }
    >
      {content}
    </a>
  );
}

export default function ContactPageContent({
  title,
  content,
}: ContactPageContentProps) {
  return (
    <main className="min-h-screen bg-[#fafcf9]">
      <section className="relative overflow-hidden border-b border-border bg-[#edf5ef]">
        <div
          aria-hidden="true"
          className="absolute -right-28 -top-28 h-72 w-72 rounded-full bg-primary/10 blur-3xl"
        />

        <div
          aria-hidden="true"
          className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-emerald-200/30 blur-3xl"
        />

        <div className="container relative py-14 md:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/75 px-4 py-2 text-xs font-bold text-primary shadow-sm">
              <MessageCircle className="h-4 w-4" />
              ارتباط با رژیتامین
            </span>

            <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
              {title || 'با ما در ارتباط باشید'}
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-sm leading-8 text-slate-600 sm:text-base">
              برای دریافت اطلاعات بیشتر، پیگیری سفارش یا هرگونه
              سوال، از راه‌های ارتباطی زیر با ما در تماس باشید.
            </p>
          </div>
        </div>
      </section>

      <section className="py-10 md:py-16">
        <div className="container">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {CONTACT_ITEMS.map((item) => (
              <ContactCard
                key={item.title}
                {...item}
              />
            ))}
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1.15fr_.85fr] lg:items-start">
            {content && (
              <article className="rounded-[28px] border border-border bg-white p-6 shadow-sm sm:p-8 md:p-10">
                <div className="mb-7 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Mail className="h-5 w-5" />
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-primary">
                      اطلاعات بیشتر
                    </span>

                    <h2 className="mt-1 text-xl font-black">
                      {title || 'تماس با ما'}
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
            )}

            <aside className="lg:sticky lg:top-24">
              <div className="overflow-hidden rounded-[30px] bg-slate-950 p-6 text-white shadow-[0_25px_70px_rgba(15,30,25,0.12)] sm:p-8">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                  <ShieldCheck className="h-7 w-7" />
                </div>

                <h2 className="mt-6 text-2xl font-black leading-tight">
                  سوالی داری؟
                  <span className="mt-1 block text-white/70">
                    با ما صحبت کن.
                  </span>
                </h2>

                <p className="mt-4 text-sm leading-7 text-white/60">
                  برای دریافت راهنمایی درباره خدمات، محصولات یا
                  پیگیری سفارش می‌توانی مستقیماً با ما تماس بگیری.
                </p>

                <div className="mt-6 space-y-3">
                  <a
                    href="tel:+989135055775"
                    className="flex h-12 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
                  >
                    <Phone className="h-4 w-4" />
                    تماس تلفنی
                  </a>

                  <a
                    href="https://wa.me/989135055775"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] text-sm font-bold text-white transition hover:bg-white/[0.08]"
                  >
                    <MessageCircle className="h-4 w-4" />
                    پیام در واتساپ
                  </a>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="pb-14 md:pb-20">
        <div className="container">
          <div className="overflow-hidden rounded-[30px] bg-primary px-6 py-10 text-center text-primary-foreground shadow-[0_25px_70px_rgba(20,120,90,0.14)] sm:px-10 md:py-14">
            <div className="mx-auto max-w-2xl">
              <h2 className="text-2xl font-black md:text-3xl">
                می‌خواهی بیشتر درباره رژیم‌ها بدانی؟
              </h2>

              <p className="mt-3 text-sm leading-7 text-white/75">
                می‌توانی محصولات و رژیم‌های موجود را بررسی کنی یا
                برای شروع از ابزار محاسبه BMI استفاده کنی.
              </p>

              <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  href="/shop"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 text-sm font-black text-primary transition hover:bg-white/90"
                >
                  مشاهده رژیم‌ها
                  <ArrowLeft className="h-4 w-4" />
                </Link>

                <Link
                  href="/#bmi"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 text-sm font-bold text-white transition hover:bg-white/15"
                >
                  محاسبه BMI
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ScrollToTopButton />
    </main>
  );
}