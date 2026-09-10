'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import {
  ArrowLeft,
  ChevronLeft,
  Clock3,
  Heart,
  Loader2,
  LogOut,
  Menu,
  Package,
  ShoppingBag,
  Truck,
  User,
  WalletCards,
  XCircle,
  CheckCircle2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

import { useCart } from '@/providers/cart-provider';
import { useWishlist } from '@/providers/wishlist-provider';
import { useAuth } from '@/providers/auth-provider';

interface Order {
  id: number;
  status: string;
  total: string;
  currency: string;
  date: string;
  pdf: {
    available: boolean;
    name: string;
  } | null;
  items: {
    name: string;
    quantity: number;
    total: string;
  }[];
}

type AccountTab = 'profile' | 'orders';

const STATUS_MAP: Record<
  string,
  {
    label: string;
    icon: typeof CheckCircle2;
    className: string;
    bg: string;
  }
> = {
  completed: {
    label: 'تکمیل شده',
    icon: CheckCircle2,
    className: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  processing: {
    label: 'در حال پردازش',
    icon: Package,
    className: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  'on-hold': {
    label: 'در انتظار بررسی',
    icon: Clock3,
    className: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  pending: {
    label: 'در انتظار پرداخت',
    icon: WalletCards,
    className: 'text-orange-600',
    bg: 'bg-orange-50',
  },
  shipped: {
    label: 'ارسال شده',
    icon: Truck,
    className: 'text-violet-600',
    bg: 'bg-violet-50',
  },
  cancelled: {
    label: 'لغو شده',
    icon: XCircle,
    className: 'text-red-600',
    bg: 'bg-red-50',
  },
};

function formatPrice(value?: string | number) {
  const numeric = Number(value || 0);
  return numeric.toLocaleString('fa-IR');
}

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return value;
  }
}

function AccountSidebar({
  activeTab,
  setActiveTab,
  phone,
  cartItems,
  wishlistItems,
  onLogout,
}: {
  activeTab: AccountTab;
  setActiveTab: (tab: AccountTab) => void;
  phone: string | null;
  cartItems: number;
  wishlistItems: number;
  onLogout: () => Promise<void>;
}) {
  const items = [
    {
      key: 'profile' as const,
      label: 'نمای کلی حساب',
      icon: User,
    },
    {
      key: 'orders' as const,
      label: 'سفارش‌های من',
      icon: Package,
    },
  ];

  return (
    <aside className="rounded-[28px] border border-border bg-white p-3 shadow-[0_12px_45px_rgba(30,20,10,0.05)]">
      <div className="rounded-[22px] bg-primary/[0.07] p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <User className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">
              حساب کاربری
            </p>

            <p
              dir="ltr"
              className="mt-1 truncate text-sm font-black text-slate-900"
            >
              {phone || '---'}
            </p>
          </div>
        </div>
      </div>

      <nav className="mt-3 space-y-1">
        {items.map((item) => {
          const active = activeTab === item.key;

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setActiveTab(item.key)}
              className={[
                'flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-right text-sm font-bold transition-all',
                active
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-slate-600 hover:bg-primary/[0.05] hover:text-primary',
              ].join(' ')}
            >
              <item.icon className="h-[18px] w-[18px] shrink-0" />

              <span className="flex-1">{item.label}</span>

              {item.key === 'orders' && (
                <ChevronLeft
                  className={[
                    'h-4 w-4',
                    active ? 'opacity-100' : 'opacity-40',
                  ].join(' ')}
                />
              )}
            </button>
          );
        })}
      </nav>

      <Separator className="my-3" />

      <nav className="space-y-1">
        <Link
          href="/cart"
          className="flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-600 transition-colors hover:bg-primary/[0.05] hover:text-primary"
        >
          <ShoppingBag className="h-[18px] w-[18px]" />

          <span className="flex-1">سبد خرید</span>

          {cartItems > 0 && (
            <Badge className="h-5 min-w-5 justify-center rounded-full bg-primary/10 px-1.5 text-[10px] text-primary hover:bg-primary/10">
              {cartItems.toLocaleString('fa-IR')}
            </Badge>
          )}
        </Link>

        <Link
          href="/wishlist"
          className="flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-600 transition-colors hover:bg-primary/[0.05] hover:text-primary"
        >
          <Heart className="h-[18px] w-[18px]" />

          <span className="flex-1">علاقه‌مندی‌ها</span>

          {wishlistItems > 0 && (
            <Badge className="h-5 min-w-5 justify-center rounded-full bg-primary/10 px-1.5 text-[10px] text-primary hover:bg-primary/10">
              {wishlistItems.toLocaleString('fa-IR')}
            </Badge>
          )}
        </Link>
      </nav>

      <Separator className="my-3" />

      <button
        type="button"
        onClick={onLogout}
        className="flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-bold text-red-500 transition-colors hover:bg-red-50"
      >
        <LogOut className="h-[18px] w-[18px]" />
        خروج از حساب
      </button>
    </aside>
  );
}

function ProfileContent({
  phone,
  cartItems,
  wishlistItems,
  totalPrice,
}: {
  phone: string | null;
  cartItems: number;
  wishlistItems: number;
  totalPrice: number;
}) {
  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-[30px] bg-[#211d1a] p-6 text-white sm:p-8">
        <div className="absolute -left-16 -top-16 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-20 right-0 h-48 w-48 rounded-full bg-primary/[0.12] blur-3xl" />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="text-xs font-semibold text-white/50">
              حساب کاربری
            </span>

            <h1 className="mt-2 text-2xl font-black sm:text-3xl">
              خوش آمدی
            </h1>

            <p className="mt-2 text-sm leading-7 text-white/60">
              اطلاعات حساب و خریدهای خودت را مدیریت کن.
            </p>
          </div>

          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] bg-primary/15 text-primary">
            <User className="h-7 w-7" />
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-border bg-white p-5 shadow-sm sm:p-7">
        <div className="mb-5">
          <h2 className="text-lg font-black text-slate-900">
            اطلاعات حساب
          </h2>

          <p className="mt-1 text-xs text-muted-foreground">
            اطلاعات فعلی حساب شما
          </p>
        </div>

        <div className="divide-y divide-border">
          <div className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
            <span className="text-sm text-muted-foreground">
              شماره تلفن
            </span>

            <strong
              dir="ltr"
              className="text-sm font-bold text-slate-900"
            >
              {phone || '---'}
            </strong>
          </div>

          <div className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
            <span className="text-sm text-muted-foreground">
              نام کاربری
            </span>

            <strong
              dir="ltr"
              className="text-sm font-bold text-slate-900"
            >
              {phone || '---'}
            </strong>
          </div>

          <div className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
            <span className="text-sm text-muted-foreground">
              ایمیل
            </span>

            <strong className="text-sm font-bold text-slate-400">
              تنظیم نشده
            </strong>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <div className="rounded-[22px] border border-border bg-white p-5 shadow-sm">
          <ShoppingBag className="h-5 w-5 text-primary" />

          <p className="mt-4 text-2xl font-black text-slate-900">
            {cartItems.toLocaleString('fa-IR')}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            آیتم در سبد
          </p>
        </div>

        <div className="rounded-[22px] border border-border bg-white p-5 shadow-sm">
          <WalletCards className="h-5 w-5 text-primary" />

          <p className="mt-4 text-lg font-black text-slate-900">
            {formatPrice(totalPrice)}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            ارزش سبد خرید
          </p>
        </div>

        <Link
          href="/wishlist"
          className="col-span-2 rounded-[22px] border border-border bg-white p-5 shadow-sm transition hover:border-primary/20 hover:shadow-md md:col-span-1"
        >
          <Heart className="h-5 w-5 text-primary" />

          <p className="mt-4 text-base font-black text-slate-900">
            علاقه‌مندی‌ها
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            {wishlistItems > 0
              ? `${wishlistItems.toLocaleString('fa-IR')} رژیم ذخیره شده`
              : 'مشاهده رژیم‌های ذخیره‌شده'}
          </p>
        </Link>
      </div>

      <section className="rounded-[28px] border border-primary/10 bg-primary/[0.04] p-5 sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <ShoppingBag className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-base font-black text-slate-900">
                سبد خرید
              </h2>

              <p className="mt-1 text-xs text-muted-foreground">
                {cartItems === 0
                  ? 'سبد خرید شما خالی است.'
                  : `${cartItems.toLocaleString('fa-IR')} آیتم در سبد خرید شما قرار دارد.`}
              </p>
            </div>
          </div>

          <Link
            href="/cart"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-xs font-bold text-primary-foreground transition hover:bg-primary/90"
          >
            مشاهده سبد
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}

function OrdersContent({
  orders,
  loading,
}: {
  orders: Order[];
  loading: boolean;
}) {
  return (
    <div className="rounded-[28px] border border-border bg-white p-5 shadow-sm sm:p-7">
      <div className="mb-7">
        <h1 className="text-2xl font-black text-slate-900">
          سفارش‌های من
        </h1>

        <p className="mt-1 text-xs text-muted-foreground">
          تاریخچه سفارش‌ها و وضعیت خریدهای شما
        </p>
      </div>

      {loading ? (
        <div className="flex min-h-[260px] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />

            <p className="text-xs text-muted-foreground">
              در حال دریافت سفارش‌ها...
            </p>
          </div>
        </div>
      ) : orders.length === 0 ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Package className="h-7 w-7" />
          </div>

          <h2 className="mt-5 text-lg font-black text-slate-900">
            هنوز سفارشی ثبت نشده
          </h2>

          <p className="mt-2 max-w-sm text-xs leading-6 text-muted-foreground">
            بعد از ثبت اولین سفارش، اطلاعات آن را در این قسمت مشاهده
            خواهید کرد.
          </p>

          <Link
            href="/shop"
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-xs font-bold text-primary-foreground transition hover:bg-primary/90"
          >
            مشاهده رژیم‌ها
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const status = STATUS_MAP[order.status] || {
              label: order.status,
              icon: Clock3,
              className: 'text-slate-500',
              bg: 'bg-slate-50',
            };

            const StatusIcon = status.icon;

            return (
              <article
                key={order.id}
                className="rounded-[22px] border border-border p-4 transition-shadow hover:shadow-md sm:p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[10px] font-black text-slate-600">
                      سفارش #{order.id.toLocaleString('fa-IR')}
                    </span>

                    <span
                      className={[
                        'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold',
                        status.bg,
                        status.className,
                      ].join(' ')}
                    >
                      <StatusIcon className="h-3.5 w-3.5" />
                      {status.label}
                    </span>

                    {order.pdf?.available && (
                      <span className="rounded-full bg-primary/10 px-3 py-1.5 text-[10px] font-bold text-primary">
                        فایل رژیم آماده است
                      </span>
                    )}
                  </div>

                  <time className="text-xs text-muted-foreground">
                    {formatDate(order.date)}
                  </time>
                </div>

                <Separator className="my-4" />

                <div className="space-y-2">
                  {order.items.slice(0, 3).map((item, index) => (
                    <div
                      key={`${order.id}-${index}`}
                      className="flex items-center justify-between gap-4 text-xs"
                    >
                      <span className="min-w-0 truncate text-slate-600">
                        {item.name}
                        <span className="mr-1 text-slate-400">
                          × {item.quantity.toLocaleString('fa-IR')}
                        </span>
                      </span>

                      <span className="shrink-0 font-bold text-slate-800">
                        {formatPrice(item.total)} تومان
                      </span>
                    </div>
                  ))}

                  {order.items.length > 3 && (
                    <p className="pt-1 text-[10px] text-muted-foreground">
                      +{' '}
                      {(order.items.length - 3).toLocaleString('fa-IR')}{' '}
                      آیتم دیگر
                    </p>
                  )}
                </div>

                <Separator className="my-4" />

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <span className="text-[10px] text-muted-foreground">
                      مبلغ کل
                    </span>

                    <p className="mt-1 text-lg font-black text-slate-900">
                      {formatPrice(order.total)} تومان
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 gap-2 rounded-xl"
                  >
                    مشاهده سفارش
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </div>

                {order.pdf?.available && (
                  <div className="mt-4 border-t border-border pt-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-black text-slate-900">
                          رژیم شما آماده است
                        </p>

                        <p className="mt-1 truncate text-[10px] text-muted-foreground">
                          {order.pdf.name}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                      <a
                        href={`/api/user/orders/${order.id}/pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-10 flex-1 items-center justify-center rounded-xl bg-primary px-4 text-xs font-bold text-primary-foreground transition hover:bg-primary/90"
                      >
                        مشاهده فایل رژیم
                      </a>

                      <a
                        href={`/api/user/orders/${order.id}/pdf?download=1`}
                        className="inline-flex h-10 flex-1 items-center justify-center rounded-xl border border-border bg-white px-4 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                      >
                        دانلود PDF
                      </a>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function AccountPageContent() {
  const [activeTab, setActiveTab] =
    useState<AccountTab>('profile');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { items, totalPrice } = useCart();
  const { items: wishlist } = useWishlist();
  const { phone, logout } = useAuth();

  useEffect(() => {
    if (activeTab !== 'orders') return;

    let cancelled = false;

    async function fetchOrders() {
      setLoadingOrders(true);

      try {
        const response = await fetch('/api/user/orders', {
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }

        const data = await response.json();

        if (!cancelled) {
          setOrders(data.orders || []);
        }
      } catch (error) {
        console.error('Failed to fetch orders:', error);

        if (!cancelled) {
          setOrders([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingOrders(false);
        }
      }
    }

    void fetchOrders();

    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  const handleLogout = async () => {
    await logout();
  };

  const changeTab = (tab: AccountTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <main className="min-h-screen bg-[#fffdf9]">
      <section className="border-b border-border bg-white">
        <div className="container py-7 md:py-10">
          <div className="flex items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-primary">
                حساب شخصی
              </span>

              <h1 className="mt-1 text-2xl font-black text-slate-900 md:text-3xl">
                حساب کاربری
              </h1>
            </div>

            <Button
              type="button"
              variant="outline"
              size="icon"
              className="rounded-xl lg:hidden"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="باز کردن منوی حساب کاربری"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      <div className="container py-6 pb-16 md:py-8 md:pb-20">
        <div className="grid gap-6 lg:grid-cols-[270px_minmax(0,1fr)] lg:items-start lg:gap-8">
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <AccountSidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                phone={phone}
                cartItems={items.length}
                wishlistItems={wishlist.length}
                onLogout={handleLogout}
              />
            </div>
          </div>

          <section className="min-w-0">
            {activeTab === 'profile' ? (
              <ProfileContent
                phone={phone}
                cartItems={items.length}
                wishlistItems={wishlist.length}
                totalPrice={totalPrice}
              />
            ) : (
              <OrdersContent
                orders={orders}
                loading={loadingOrders}
              />
            )}
          </section>
        </div>
      </div>

      <Sheet
        open={mobileMenuOpen}
        onOpenChange={setMobileMenuOpen}
      >
        <SheetContent
          side="right"
          className="w-[86%] max-w-[380px] overflow-y-auto rounded-l-[28px] p-4"
        >
          <SheetHeader className="mb-3 px-1 text-right">
            <SheetTitle>حساب کاربری</SheetTitle>
          </SheetHeader>

          <AccountSidebar
            activeTab={activeTab}
            setActiveTab={changeTab}
            phone={phone}
            cartItems={items.length}
            wishlistItems={wishlist.length}
            onLogout={handleLogout}
          />
        </SheetContent>
      </Sheet>
    </main>
  );
}