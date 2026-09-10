'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  Heart,
  Home,
  Info,
  LogIn,
  LogOut,
  Menu,
  Newspaper,
  Phone,
  Search,
  ShoppingCart,
  Store,
  User,
  X,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

import { useAuth } from '@/providers/auth-provider';
import { useCart } from '@/providers/cart-provider';
import { useWishlist } from '@/providers/wishlist-provider';

const NAV_ITEMS = [
  { label: 'خانه', href: '/', icon: Home },
  { label: 'فروشگاه', href: '/shop', icon: Store },
  { label: 'مقالات', href: '/blog', icon: Newspaper },
  { label: 'درباره ما', href: '/about', icon: Info },
  { label: 'تماس با ما', href: '/contact', icon: Phone },
];

const iconButtonClass =
  'relative flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-accent hover:text-primary focus-visible:ring-2 focus-visible:ring-primary/20';

function isActivePath(pathname: string, href: string) {
  return pathname === href || (href !== '/' && pathname.startsWith(href));
}

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [scrolled, setScrolled] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  const { isLoggedIn, phone, logout } = useAuth();
  const { totalItems: cartTotal } = useCart();
  const { totalItems: wishlistTotal } = useWishlist();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  const submitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const value = search.trim();

    if (!value) {
      return;
    }

    router.push(`/shop?search=${encodeURIComponent(value)}`);
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const renderBadge = (count: number) =>
    count > 0 ? (
      <Badge className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-primary px-1 text-[9px] font-black text-white">
        {count}
      </Badge>
    ) : null;

  return (
    <>
      <header
        className={[
          'fixed inset-x-0 top-0 z-50 border-b transition-all duration-200',
          scrolled
            ? 'border-border/80 bg-white/95 shadow-[0_8px_30px_rgba(30,30,20,0.06)] backdrop-blur-xl'
            : 'border-border/60 bg-white/98',
        ].join(' ')}
      >
        <div className="container flex h-[72px] items-center gap-2 sm:gap-3">
          {/* Mobile menu */}
<Button
  variant="ghost"
  size="icon"
  className="h-10 w-10 shrink-0 rounded-xl md:hidden"
  onClick={() => setMobileOpen(true)}
  aria-label="باز کردن منو"
>
  <Menu className="!h-7 !w-7" />
</Button>

          {/* Logo */}
          <Link
            href="/"
            aria-label="رژیتامین"
            className="relative flex h-12 w-[132px] shrink-0 items-center overflow-visible sm:h-12 sm:w-[140px] md:h-12 md:w-[150px]"
          >
<Image
  src="/logo.png"
  alt="رژیتامین"
  width={150}
  height={48}
  priority
  sizes="160px"
  className="w-[160px] !h-auto max-w-none object-contain md:w-[150px]"
/>
          </Link>

          {/* Desktop search */}
          <form
            onSubmit={submitSearch}
            className="mx-3 hidden min-w-0 max-w-2xl flex-1 md:block"
          >
            <div className="relative">
              <Search className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="جستجوی محصول، برند یا مقاله..."
                aria-label="جستجو"
                className="h-11 w-full rounded-2xl border border-border bg-muted/60 pr-11 pl-4 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground hover:border-primary/20 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
              />
            </div>
          </form>

          {/* Actions */}
          <div className="mr-auto flex shrink-0 items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className={`${iconButtonClass} md:hidden`}
              onClick={() => setSearchOpen((value) => !value)}
              aria-label="جستجو"
              aria-expanded={searchOpen}
            >
              <Search className="h-5 w-5" />
            </Button>

            <Link
              href="/wishlist"
              className={`${iconButtonClass} hidden sm:flex`}
              aria-label="علاقه‌مندی‌ها"
            >
              <Heart className="h-[19px] w-[19px]" />
              {renderBadge(wishlistTotal)}
            </Link>

            <Link
              href="/cart"
              className={iconButtonClass}
              aria-label="سبد خرید"
            >
              <ShoppingCart className="h-[19px] w-[19px]" />
              {renderBadge(cartTotal)}
            </Link>

            {isLoggedIn ? (
              <div className="hidden items-center gap-1 md:flex">
                <Link href="/account">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-10 max-w-[150px] gap-2 rounded-xl px-3"
                  >
                    <User className="h-4 w-4 shrink-0" />
                    <span className="truncate">{phone}</span>
                  </Button>
                </Link>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-xl text-muted-foreground hover:bg-red-50 hover:text-red-500"
                  onClick={handleLogout}
                  aria-label="خروج"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Link href="/auth/login" className="hidden md:block">
                <Button className="h-10 rounded-xl px-4 font-bold shadow-sm">
                  <User className="h-4 w-4" />
                  ورود / ثبت‌نام
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile search */}
        {searchOpen && (
          <div className="border-t border-border bg-white px-4 py-3 md:hidden">
            <form onSubmit={submitSearch}>
              <div className="relative">
                <Search className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <input
                  autoFocus
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="جستجوی محصول یا مقاله..."
                  aria-label="جستجو"
                  className="h-11 w-full rounded-xl border border-border bg-muted/50 pr-10 pl-4 text-sm outline-none transition focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
                />
              </div>
            </form>
          </div>
        )}

        {/* Desktop navigation */}
        <nav className="hidden border-t border-border/60 md:block">
          <div className="container flex h-11 items-center">
            <div className="flex h-full items-center gap-1">
              {NAV_ITEMS.map((item) => {
                const active = isActivePath(pathname, item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={[
                      'relative flex h-full items-center gap-2 px-4 text-sm font-bold transition-colors',
                      active
                        ? 'text-primary'
                        : 'text-muted-foreground hover:text-primary',
                    ].join(' ')}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}

                    {active && (
                      <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-primary" />
                    )}
                  </Link>
                );
              })}
            </div>

            <Link
              href="/shop"
              className="mr-auto text-xs font-bold text-primary transition-colors hover:text-[var(--brand-orange-dark)]"
            >
              مشاهده محصولات
            </Link>
          </div>
        </nav>
      </header>

      {/* Mobile menu */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="right"
          className="w-[86%] max-w-[380px] overflow-hidden rounded-l-[28px] p-0"
        >
          <SheetHeader className="border-b border-border bg-white px-5 pb-4 pt-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <Image
                    src="/logo.png"
                    alt=""
                    width={32}
                    height={32}
                    className="h-7 w-auto object-contain"
                  />
                </div>

                <SheetTitle className="truncate text-right text-base font-black">
                  منوی رژیتامین
                </SheetTitle>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 shrink-0 rounded-xl"
                onClick={() => setMobileOpen(false)}
                aria-label="بستن منو"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </SheetHeader>

          <div className="flex h-full flex-col bg-background">
            <nav className="space-y-1 p-4">
              {NAV_ITEMS.map((item) => {
                const active = isActivePath(pathname, item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={[
                      'flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-bold transition-all',
                      active
                        ? 'bg-primary/10 text-primary'
                        : 'text-foreground hover:bg-muted',
                    ].join(' ')}
                  >
                    <span
                      className={[
                        'flex h-9 w-9 items-center justify-center rounded-xl',
                        active
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground',
                      ].join(' ')}
                    >
                      <Icon className="h-[18px] w-[18px]" />
                    </span>

                    {item.label}
                  </Link>
                );
              })}

              <Link
                href="/wishlist"
                className="flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-bold text-foreground transition hover:bg-muted"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                  <Heart className="h-[18px] w-[18px]" />
                </span>

                علاقه‌مندی‌ها

                {wishlistTotal > 0 && (
                  <Badge className="mr-auto rounded-full bg-primary px-2.5 text-[10px] text-white">
                    {wishlistTotal.toLocaleString('fa-IR')}
                  </Badge>
                )}
              </Link>
            </nav>

            <div className="mt-auto border-t border-border bg-white p-4">
              {isLoggedIn ? (
                <div className="space-y-3">
                  <Link
                    href="/account"
                    className="flex items-center gap-3 rounded-2xl bg-muted/70 p-3.5"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <User className="h-5 w-5" />
                    </span>

                    <div className="min-w-0">
                      <span className="block text-[10px] font-medium text-muted-foreground">
                        حساب کاربری
                      </span>

                      <span className="mt-0.5 block truncate text-sm font-black">
                        {phone}
                      </span>
                    </div>
                  </Link>

                  <Button
                    variant="outline"
                    className="h-12 w-full rounded-2xl gap-2 font-bold hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    خروج از حساب
                  </Button>
                </div>
              ) : (
                <Link href="/auth/login">
                  <Button className="h-12 w-full rounded-2xl gap-2 font-bold shadow-sm">
                    <LogIn className="h-4 w-4" />
                    ورود / ثبت‌نام
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}