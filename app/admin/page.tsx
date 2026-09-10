import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  ArrowLeft,
  ClipboardList,
  Clock3,
  FileCheck2,
  Truck,
} from 'lucide-react';

import { getAdminOrders } from '@/lib/admin-orders';
import { getAdminSession } from '@/lib/admin-auth';

const STATUS_LABELS = {
  pending: 'جدید',
  preparing: 'در حال آماده‌سازی',
  ready: 'آماده تحویل',
  delivered: 'تحویل شده',
} as const;

export default async function AdminDashboard() {
  const session = await getAdminSession();

  if (!session) {
    redirect('/admin/login');
  }

  const orders = await getAdminOrders();

  const stats = {
    total: orders.length,
    pending: orders.filter(
      (order) => order.deliveryStatus === 'pending',
    ).length,
    ready: orders.filter(
      (order) => order.deliveryStatus === 'ready',
    ).length,
    delivered: orders.filter(
      (order) => order.deliveryStatus === 'delivered',
    ).length,
  };

  const recentOrders = orders.slice(0, 8);

  return (
    <main
      dir="rtl"
      className="min-h-[calc(100vh-72px)] bg-[#fffdf9] px-4 py-8 md:px-8 md:py-10"
    >
      <div className="mx-auto w-full max-w-7xl">
        <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="text-xs font-bold text-primary">
              مدیریت رژیتامین
            </span>

            <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900">
              داشبورد
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              مدیریت سفارش‌ها و تحویل رژیم‌ها
            </p>
          </div>

          <Link
            href="/admin/orders"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-sm font-black text-primary-foreground shadow-lg shadow-primary/10 transition hover:bg-primary/90"
          >
            مشاهده سفارش‌ها
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </header>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="کل سفارش‌ها"
            value={stats.total}
            icon={ClipboardList}
          />

          <StatCard
            title="در انتظار بررسی"
            value={stats.pending}
            icon={Clock3}
          />

          <StatCard
            title="آماده تحویل"
            value={stats.ready}
            icon={FileCheck2}
          />

          <StatCard
            title="تحویل شده"
            value={stats.delivered}
            icon={Truck}
          />
        </section>

        <section className="mt-8 overflow-hidden rounded-[28px] border border-border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-5 py-5 sm:px-6">
            <div>
              <h2 className="font-black text-slate-900">
                سفارش‌های اخیر
              </h2>

              <p className="mt-1 text-xs text-muted-foreground">
                آخرین سفارش‌های ثبت‌شده
              </p>
            </div>

            <Link
              href="/admin/orders"
              className="text-xs font-bold text-primary transition hover:text-primary/80 sm:text-sm"
            >
              همه سفارش‌ها
            </Link>
          </div>

          <div className="divide-y divide-border">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="flex flex-col gap-3 px-5 py-4 transition hover:bg-primary/[0.02] sm:px-6 md:flex-row md:items-center md:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-black text-slate-900">
                      #{order.id.toLocaleString('fa-IR')}
                    </span>

                    <span
                      dir="ltr"
                      className="text-xs text-slate-400"
                    >
                      {order.customerPhone || 'بدون شماره'}
                    </span>
                  </div>

                  <p className="mt-1 truncate text-sm text-slate-600">
                    {order.items
                      .map((item) => item.name)
                      .join('، ')}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-4 md:justify-end">
                  <span className="shrink-0 text-sm font-black text-slate-900">
                    {Number(order.total).toLocaleString('fa-IR')}{' '}
                    تومان
                  </span>

                  <DeliveryBadge status={order.deliveryStatus} />
                </div>
              </Link>
            ))}

            {!recentOrders.length && (
              <div className="px-5 py-12 text-center text-sm text-muted-foreground">
                هنوز سفارشی وجود ندارد.
              </div>
            )}
          </div>
        </section>

        <section className="mt-6 rounded-[22px] border border-primary/10 bg-primary/[0.035] px-5 py-4">
          <p className="text-xs leading-6 text-slate-600">
            از این بخش می‌توانید سفارش‌ها را بررسی کرده، وضعیت تحویل
            را تغییر دهید و فایل رژیم را مدیریت کنید.
          </p>
        </section>
      </div>
    </main>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: number;
  icon: typeof ClipboardList;
}) {
  return (
    <div className="rounded-[24px] border border-border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-muted-foreground">
            {title}
          </p>

          <p className="mt-2 text-3xl font-black text-slate-900">
            {value.toLocaleString('fa-IR')}
          </p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function DeliveryBadge({
  status,
}: {
  status: keyof typeof STATUS_LABELS;
}) {
  const classes = {
    pending: 'bg-amber-50 text-amber-700',
    preparing: 'bg-blue-50 text-blue-700',
    ready: 'bg-primary/10 text-primary',
    delivered: 'bg-emerald-50 text-emerald-700',
  };

  return (
    <span
      className={`shrink-0 rounded-full px-3 py-1.5 text-[10px] font-black ${classes[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}