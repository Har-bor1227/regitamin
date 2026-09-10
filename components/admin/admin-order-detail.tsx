'use client';

import { useMemo, useState } from 'react';
import {
  Check,
  CheckCircle2,
  Clock3,
  Download,
  FileText,
  Loader2,
  PackageCheck,
  RefreshCw,
  Upload,
  UserRound,
  XCircle,
} from 'lucide-react';

import {
  DIET_QUESTIONNAIRE_QUESTIONS,
} from '@/constants/diet-questionnaire';

import type {
  AdminOrder,
  DeliveryStatus,
} from '@/lib/admin-orders';

const DELIVERY_OPTIONS: Array<{
  value: DeliveryStatus;
  label: string;
  icon: typeof Clock3;
}> = [
  {
    value: 'pending',
    label: 'جدید',
    icon: Clock3,
  },
  {
    value: 'preparing',
    label: 'در حال آماده‌سازی',
    icon: RefreshCw,
  },
  {
    value: 'ready',
    label: 'آماده تحویل',
    icon: PackageCheck,
  },
  {
    value: 'delivered',
    label: 'تحویل شده',
    icon: Check,
  },
];

const ANSWER_LABELS: Record<string, string> = {
  weight_loss: 'کاهش وزن',
  weight_gain: 'افزایش وزن',
  weight_maintenance: 'حفظ وزن',
  fitness: 'تناسب اندام',
  healthy_eating: 'تغذیه سالم‌تر',

  female: 'خانم',
  male: 'آقا',

  never: 'تا حالا رژیم نگرفته',
  once: 'یک بار',
  several: 'چند بار',
  many: 'رژیم‌های مختلف زیاد',

  sedentary: 'خیلی کم',
  light: 'کم',
  moderate: 'متوسط',
  high: 'زیاد',
  professional: 'خیلی زیاد',

  none: 'ندارم',
  milk: 'شیر و لبنیات',
  egg: 'تخم‌مرغ',
  nuts: 'مغزها',
  gluten: 'گلوتن',
  seafood: 'غذاهای دریایی',
  other: 'مورد دیگر',

  diabetes: 'دیابت',
  thyroid: 'مشکلات تیروئید',
  pcos: 'PCOS',
  hypertension: 'فشار خون',
  fatty_liver: 'کبد چرب',
  digestive: 'مشکلات گوارشی',
  cardiovascular: 'مشکلات قلبی',

  one_two: '۱ تا ۲ وعده',
  three: '۳ وعده',
  four: '۴ وعده',
  five_plus: '۵ وعده یا بیشتر',
  irregular: 'نامنظم',

  very_little: 'خیلی کم',
  little: 'کم',
};

function formatAnswer(
  value: unknown,
  options?: Array<{
    value: string;
    label: string;
  }>,
  unit?: string,
) {
  if (value === undefined || value === null || value === '') {
    return (
      <span className="font-medium text-slate-300">
        پاسخ ثبت نشده
      </span>
    );
  }

  if (Array.isArray(value)) {
    return (
      <div className="flex flex-wrap gap-2">
        {value.map((item, index) => (
          <span
            key={`${item}-${index}`}
            className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-black text-primary"
          >
            {getOptionLabel(String(item), options)}
          </span>
        ))}
      </div>
    );
  }

  return (
    <>
      {getOptionLabel(String(value).trim(), options)}
      {unit && (
        <span className="mr-1 font-medium text-slate-500">
          {unit}
        </span>
      )}
    </>
  );
}

function getOptionLabel(
  value: string,
  options?: Array<{
    value: string;
    label: string;
  }>,
) {
  return (
    options?.find((item) => item.value === value)?.label ||
    ANSWER_LABELS[value] ||
    value
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="shrink-0 text-xs font-bold text-slate-400">
        {label}
      </span>

      <span className="text-left text-sm font-black leading-6 text-slate-800">
        {value}
      </span>
    </div>
  );
}

export default function AdminOrderDetail({
  initialOrder,
}: {
  initialOrder: AdminOrder;
}) {
  const [order, setOrder] = useState(initialOrder);
  const [changingStatus, setChangingStatus] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const questionnaire = order.questionnaire;

  const questionRows = useMemo(() => {
    if (!questionnaire) return [];

    return DIET_QUESTIONNAIRE_QUESTIONS.map((question) => ({
      question,
      value: questionnaire.answers[question.id],
    }));
  }, [questionnaire]);

  async function changeDeliveryStatus(status: DeliveryStatus) {
    if (status === order.deliveryStatus) return;

    setChangingStatus(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(
        `/api/admin/orders/${order.id}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status }),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || 'تغییر وضعیت انجام نشد.',
        );
      }

      setOrder(data.order);
      setMessage('وضعیت سفارش با موفقیت تغییر کرد.');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'تغییر وضعیت انجام نشد.',
      );
    } finally {
      setChangingStatus(false);
    }
  }

  async function handleUpload(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;

    setError('');
    setMessage('');

    if (file.type !== 'application/pdf') {
      setError('فقط فایل PDF مجاز است.');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setError('حداکثر حجم فایل ۲۰ مگابایت است.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);

    try {
      const response = await fetch(
        `/api/admin/orders/${order.id}/pdf`,
        {
          method: 'POST',
          body: formData,
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || 'آپلود فایل انجام نشد.',
        );
      }

      setOrder(data.order);
      setMessage('فایل رژیم با موفقیت آپلود شد.');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'آپلود فایل انجام نشد.',
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-5">
      {message && (
        <div className="flex items-center gap-2 rounded-2xl border border-primary/15 bg-primary/[0.05] px-4 py-3 text-sm font-bold text-primary">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {message}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
          <XCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-[26px] border border-border bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <PackageCheck className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-black text-slate-900">
                اطلاعات سفارش
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                شماره سفارش #{order.id}
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <InfoRow
              label="مبلغ"
              value={`${Number(order.total).toLocaleString('fa-IR')} تومان`}
            />

            <InfoRow
              label="شماره تراکنش"
              value={order.transactionId || '—'}
            />

            <InfoRow
              label="تاریخ"
              value={
                order.dateCreated
                  ? new Date(order.dateCreated).toLocaleString('fa-IR')
                  : '—'
              }
            />

            <InfoRow
              label="محصول"
              value={
                order.items
                  .map(
                    (item) =>
                      `${item.name} × ${item.quantity}`,
                  )
                  .join('، ') || '—'
              }
            />
          </div>
        </section>

        <section className="rounded-[26px] border border-border bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <UserRound className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-black text-slate-900">
                اطلاعات مشتری
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                اطلاعات ثبت‌شده برای سفارش
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <InfoRow
              label="نام"
              value={order.customerName || '—'}
            />

            <InfoRow
              label="شماره موبایل"
              value={order.customerPhone || '—'}
            />

            <InfoRow
              label="Customer ID"
              value={
                order.customerId
                  ? String(order.customerId)
                  : '—'
              }
            />

            <InfoRow
              label="وضعیت پرداخت"
              value={order.status}
            />
          </div>
        </section>
      </div>

      <section className="rounded-[26px] border border-border bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-black text-slate-900">
              وضعیت تحویل
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              مراحل آماده‌سازی و تحویل رژیم
            </p>
          </div>

          {changingStatus && (
            <div className="flex items-center gap-2 text-xs font-bold text-primary">
              <Loader2 className="h-4 w-4 animate-spin" />
              در حال ذخیره
            </div>
          )}
        </div>

        <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {DELIVERY_OPTIONS.map(
            ({ value, label, icon: Icon }) => {
              const active = order.deliveryStatus === value;

              return (
                <button
                  key={value}
                  type="button"
                  disabled={changingStatus}
                  onClick={() => void changeDeliveryStatus(value)}
                  className={[
                    'flex min-h-12 items-center justify-center gap-2 rounded-2xl border px-4 text-sm font-black transition',
                    active
                      ? 'border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/10'
                      : 'border-border bg-white text-slate-600 hover:border-primary/30 hover:bg-primary/[0.04]',
                  ].join(' ')}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              );
            },
          )}
        </div>
      </section>

      <section className="overflow-hidden rounded-[26px] border border-border bg-white shadow-sm">
        <div className="border-b border-border px-5 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <FileText className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-black text-slate-900">
                پاسخ‌های پرسشنامه
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                پاسخ‌های ثبت‌شده هنگام خرید
              </p>
            </div>
          </div>
        </div>

        {!questionnaire ? (
          <div className="px-5 py-12 text-center text-sm text-slate-500">
            برای این سفارش اطلاعات پرسشنامه وجود ندارد.
          </div>
        ) : (
          <>
            <div className="grid gap-px bg-slate-100 md:grid-cols-2">
              {questionRows.map(({ question, value }) => (
                <div
                  key={question.id}
                  className="bg-white px-5 py-5"
                >
                  <p className="text-xs font-bold text-slate-400">
                    {question.title}
                  </p>

                  <div className="mt-2 text-sm font-black leading-7 text-slate-900">
                    {formatAnswer(
                      value,
                      question.options,
                      question.unit,
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border bg-slate-50 px-5 py-4 sm:px-6">
              <div className="grid gap-3 sm:grid-cols-3">
                <InfoRow
                  label="نسخه پرسشنامه"
                  value={questionnaire.version || '—'}
                />

                <InfoRow
                  label="شناسه فرم"
                  value={questionnaire.sessionId || '—'}
                />

                <InfoRow
                  label="زمان تکمیل"
                  value={
                    questionnaire.completedAt
                      ? new Date(
                          Number(questionnaire.completedAt),
                        ).toLocaleString('fa-IR')
                      : '—'
                  }
                />
              </div>
            </div>
          </>
        )}
      </section>

      <section className="rounded-[26px] border border-border bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-black text-slate-900">
              فایل رژیم
            </h2>

            <p className="mt-1 max-w-xl text-xs leading-6 text-slate-500">
              فایل PDF نهایی رژیم را برای این سفارش آپلود کنید.
              حداکثر حجم فایل ۲۰ مگابایت است.
            </p>
          </div>

          <label
            className={[
              'inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-2xl px-5 text-sm font-black transition',
              uploading
                ? 'pointer-events-none bg-slate-200 text-slate-400'
                : 'bg-primary text-primary-foreground shadow-lg shadow-primary/10 hover:bg-primary/90',
            ].join(' ')}
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                در حال آپلود
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                {order.pdf ? 'جایگزینی PDF' : 'آپلود PDF'}
              </>
            )}

            <input
              type="file"
              accept="application/pdf,.pdf"
              className="hidden"
              disabled={uploading}
              onChange={handleUpload}
            />
          </label>
        </div>

        {order.pdf ? (
          <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-primary/10 bg-primary/[0.03] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500">
                <FileText className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-black text-slate-900">
                  {order.pdf.name}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  فایل رژیم سفارش #{order.id}
                </p>
              </div>
            </div>

            <a
              href={order.pdf.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 text-xs font-black text-slate-700 transition hover:border-primary/30 hover:text-primary"
            >
              <Download className="h-4 w-4" />
              مشاهده PDF
            </a>
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border border-dashed border-border px-5 py-8 text-center">
            <FileText className="mx-auto h-7 w-7 text-slate-300" />

            <p className="mt-3 text-sm font-bold text-slate-500">
              هنوز فایلی برای این سفارش ثبت نشده است.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}