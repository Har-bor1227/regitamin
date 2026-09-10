import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowRight } from 'lucide-react';

import { getAdminOrder } from '@/lib/admin-orders';
import { getAdminSession } from '@/lib/admin-auth';
import AdminOrderDetail from '@/components/admin/admin-order-detail';

export const dynamic = 'force-dynamic';

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getAdminSession();

  if (!session) {
    redirect('/admin/login');
  }

  const { id } = await params;
  const orderId = Number(id);

  if (!Number.isInteger(orderId) || orderId <= 0) {
    notFound();
  }

  let order;

  try {
    order = await getAdminOrder(orderId);
  } catch {
    notFound();
  }

  return (
    <main
      dir="rtl"
      className="min-h-[calc(100vh-72px)] bg-[#fffdf9] px-4 py-8 md:px-8 md:py-10"
    >
      <div className="mx-auto max-w-6xl">
        <Link
          href="/admin/orders"
          className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-primary"
        >
          <ArrowRight className="h-4 w-4" />
          بازگشت به سفارش‌ها
        </Link>

        <header className="mb-7">
          <span className="text-xs font-bold text-primary">
            سفارش
          </span>

          <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900">
            سفارش #{order.id.toLocaleString('fa-IR')}
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            مشاهده اطلاعات مشتری، پاسخ‌های پرسشنامه و مدیریت تحویل
          </p>
        </header>

        <AdminOrderDetail initialOrder={order} />
      </div>
    </main>
  );
}