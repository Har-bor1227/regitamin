import Link from 'next/link';
import Image from 'next/image';
import {
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const FOOTER_LINKS = [
  { label: 'فروشگاه', href: '/shop' },
  { label: 'درباره رژیتامین', href: '/about' },
  { label: 'مقالات', href: '/blog' },
  { label: 'تماس با ما', href: '/contact' },
];

const SERVICE_LINKS = [
  { label: 'حساب کاربری', href: '/account' },
  { label: 'سبد خرید', href: '/cart' },
  { label: 'علاقه‌مندی‌ها', href: '/wishlist' },
  { label: 'پشتیبانی و تماس', href: '/contact' },
];

const SOCIAL_LINKS = [
  {
    href: 'https://wa.me/989135055775',
    label: 'واتساپ',
    icon: MessageCircle,
  },
  {
    href: 'tel:+989135055775',
    label: 'تماس تلفنی',
    icon: Phone,
  },
  {
    href: 'mailto:info@rejitamin.com',
    label: 'ایمیل',
    icon: Mail,
  },
];

const CONTACT_ITEMS = [
  {
    icon: Phone,
    label: 'شماره تماس',
    content: (
      <a
        href="tel:+989135055775"
        dir="ltr"
        className="font-semibold transition-colors hover:text-[var(--brand-orange)]"
      >
        0913 505 5775
      </a>
    ),
  },
  {
    icon: MapPin,
    label: 'آدرس',
    content: (
      <span>
        اصفهان، شهرک صنعتی محمودآباد، خیابان ۲۸، ساختمان ماهفر
      </span>
    ),
  },
  {
    icon: Clock,
    label: 'ساعات کاری',
    content: (
      <span>
        شنبه تا پنجشنبه
        <br />
        ۹ صبح تا ۶ عصر
      </span>
    ),
  },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-border bg-[#211D1A] text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-[var(--brand-orange)]/8 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-[var(--brand-orange-dark)]/10 blur-3xl"
      />

      <div className="container relative">
        <div className="grid gap-10 py-12 sm:py-14 lg:grid-cols-[1.25fr_.8fr_.8fr_1fr] lg:gap-14 lg:py-16">
          {/* Brand */}
          <div>
            <Link
              href="/"
              aria-label="رژیتامین"
              className="inline-flex"
            >
              <div className="relative h-12 w-36 sm:h-14 sm:w-40">
                <Image
                  src="/logo-1.png"
                  alt="رژیتامین"
                  fill
                  sizes="160px"
                  className="object-contain object-right"
                />
              </div>
            </Link>

            <p className="mt-5 max-w-md text-sm leading-8 text-white/60">
              رژیتامین، فروشگاه تخصصی محصولات و مکمل‌های سلامت و زیبایی
              با ارائه محصولات باکیفیت و تجربه‌ای مطمئن برای خرید آنلاین.
            </p>

            <div className="mt-6 flex items-center gap-2.5">
              {SOCIAL_LINKS.map((item) => {
                const Icon = item.icon;

                return (
                  <a
                    key={item.label}
                    href={item.href}
                    target={
                      item.href.startsWith('http')
                        ? '_blank'
                        : undefined
                    }
                    rel={
                      item.href.startsWith('http')
                        ? 'noopener noreferrer'
                        : undefined
                    }
                    aria-label={item.label}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-white/65 transition-all hover:-translate-y-0.5 hover:border-[var(--brand-orange)]/30 hover:bg-[var(--brand-orange)] hover:text-white"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick links */}
          <FooterLinkGroup
            title="دسترسی سریع"
            links={FOOTER_LINKS}
          />

          {/* Services */}
          <FooterLinkGroup
            title="خدمات مشتریان"
            links={SERVICE_LINKS}
          />

          {/* Contact */}
          <div>
            <h2 className="text-sm font-black text-white sm:text-base">
              اطلاعات تماس
            </h2>

            <div className="mt-5 space-y-5">
              {CONTACT_ITEMS.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="flex items-start gap-3"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-orange)]/10 text-[var(--brand-orange)]">
                      <Icon className="h-4 w-4" />
                    </span>

                    <div className="min-w-0">
                      <span className="block text-[10px] font-medium text-white/35">
                        {item.label}
                      </span>

                      <div className="mt-1 text-sm leading-7 text-white/65">
                        {item.content}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <Separator className="bg-white/10" />

        <div className="flex flex-col gap-4 py-5 text-center text-[11px] text-white/35 sm:text-xs md:flex-row md:items-center md:justify-between md:text-right">
          <p>
            © {currentYear} تمامی حقوق برای رژیتامین محفوظ است.
          </p>

          <div className="flex items-center justify-center gap-5">
            <Link
              href="/privacy"
              className="transition-colors hover:text-white"
            >
              حریم خصوصی
            </Link>

            <Link
              href="/terms"
              className="transition-colors hover:text-white"
            >
              قوانین و مقررات
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLinkGroup({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h2 className="text-sm font-black text-white sm:text-base">
        {title}
      </h2>

      <nav className="mt-5 space-y-3.5">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="block text-sm text-white/55 transition-colors hover:text-[var(--brand-orange)]"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}