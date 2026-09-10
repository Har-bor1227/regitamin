import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft, Search } from 'lucide-react';

import { getAdminOrders } from '@/lib/admin-orders';
import { getAdminSession } from '@/lib/admin-auth';

const STATUS_LABELS = {
  pending: 'جدید',
  preparing: 'در حال آماده‌سازی',
  ready: 'آماده تحویل',
  delivered: 'تحویل شده',
} as const;

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    delivery?: string;
  }>;
}) {
  const session = await getAdminSession();

  if (!session) {
    redirect('/admin/login');
  }

  const params = await searchParams;
  const search = params.search || '';
  const delivery = params.delivery || 'all';

  const orders = await getAdminOrders({
    search,
    deliveryStatus: delivery,
  });

  return (
    <main
      dir="rtl"
      className="min-h-[calc(100vh-72px)] bg-[#fffdf9] px-4 py-8 md:px-8 md:py-10"
    >
      <div className="mx-auto max-w-7xl">
        <header>
          <span className="text-xs font-bold text-primary">
            مدیریت
          </span>

          <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900">
            سفارش‌ها
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            مشاهده و مدیریت سفارش‌های ثبت‌شده
          </p>
        </header>

        <form
          method="GET"
          className="mt-6 grid gap-3 rounded-[24px] border border-border bg-white p-4 shadow-sm md:grid-cols-[minmax(0,1fr)_220px_auto]"
        >
          <div className="relative">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              name="search"
              defaultValue={search}
              placeholder="جستجوی شماره سفارش، موبایل یا محصول..."
              className="h-11 w-full rounded-xl border border-input bg-slate-50 pr-10 pl-4 text-sm outline-none transition focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
            />
          </div>

          <select
            name="delivery"
            defaultValue={delivery}
            className="h-11 rounded-xl border border-input bg-slate-50 px-3 text-sm outline-none transition focus:border-primary focus:bg-white"
          >
            <option value="all">همه وضعیت‌ها</option>
            <option value="pending">جدید</option>
            <option value="preparing">در حال آماده‌سازی</option>
            <option value="ready">آماده تحویل</option>
            <option value="delivered">تحویل شده</option>
          </select>

          <button
            type="submit"
            className="h-11 rounded-xl bg-primary px-5 text-sm font-black text-primary-foreground shadow-lg shadow-primary/10 transition hover:bg-primary/90"
          >
            جستجو
          </button>
        </form>

        <section className="mt-6 overflow-hidden rounded-[26px] border border-border bg-white shadow-sm">
          <div className="hidden grid-cols-[100px_minmax(0,1fr)_180px_150px_160px] gap-4 border-b border-border bg-slate-50 px-5 py-4 text-xs font-black text-slate-500 md:grid">
            <span>شماره</span>
            <span>مشتری</span>
            <span>محصول</span>
            <span>مبلغ</span>
            <span>وضعیت</span>
          </div>

          <div className="divide-y divide-border">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="grid gap-3 px-5 py-4 transition hover:bg-primary/[0.02] md:grid-cols-[100px_minmax(0,1fr)_180px_150px_160px] md:items-center md:gap-4"
              >
                <div className="font-black text-slate-900">
                  #{order.id.toLocaleString('fa-IR')}
                </div>

                <div className="min-w-0">
                  <p className="truncate font-bold text-slate-900">
                    {order.customerName || 'بدون نام'}
                  </p>

                  <p
                    dir="ltr"
                    className="mt-1 w-fit text-xs text-slate-500"
                  >
                    {order.customerPhone || '—'}
                  </p>
                </div>

                <div className="truncate text-sm text-slate-600">
                  {order.items
                    .map((item) => item.name)
                    .join('، ')}
                </div>

                <div className="font-black text-slate-900">
                  {Number(order.total).toLocaleString('fa-IR')}{' '}
                  تومان
                </div>

                <div>
                  <span
                    className={[
                      'inline-flex rounded-full px-3 py-1.5 text-[10px] font-black',
                      getStatusClass(order.deliveryStatus),
                    ].join(' ')}
                  >
                    {STATUS_LABELS[order.deliveryStatus]}
                  </span>
                </div>
              </Link>
            ))}

            {!orders.length && (
              <div className="px-5 py-16 text-center">
                <p className="font-black text-slate-900">
                  سفارشی پیدا نشد.
                </p>

                <p className="mt-2 text-sm text-muted-foreground">
                  عبارت جستجو یا فیلتر را تغییر دهید.
                </p>
              </div>
            )}
          </div>
        </section>

        <Link
          href="/admin"
          className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          بازگشت به داشبورد
        </Link>
      </div>
    </main>
  );
}

function getStatusClass(
  status: keyof typeof STATUS_LABELS,
) {
  const classes = {
    pending: 'bg-amber-50 text-amber-700',
    preparing: 'bg-blue-50 text-blue-700',
    ready: 'bg-primary/10 text-primary',
    delivered: 'bg-emerald-50 text-emerald-700',
  };

  return classes[status];
}