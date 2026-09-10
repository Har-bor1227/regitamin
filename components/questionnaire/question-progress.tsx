'use client';

interface QuestionProgressProps {
  current: number;
  total: number;
}

export default function QuestionProgress({
  current,
  total,
}: QuestionProgressProps) {
  const progress =
    total > 1
      ? ((current - 1) / (total - 1)) * 100
      : total === 1
        ? 100
        : 0;

  return (
    <div className="w-full">
      <div className="mb-2.5 flex items-center justify-between gap-3">
        <span className="text-[11px] font-black text-[var(--brand-orange-dark)]">
          اطلاعات رژیم
        </span>

        <span className="text-[11px] font-semibold text-muted-foreground">
          سؤال {current.toLocaleString('fa-IR')} از{' '}
          {total.toLocaleString('fa-IR')}
        </span>
      </div>

      <div
        className="relative h-1.5 overflow-hidden rounded-full bg-slate-100"
        aria-hidden="true"
      >
        <div
          className="absolute inset-y-0 right-0 rounded-full bg-gradient-to-l from-[var(--brand-orange-dark)] to-[var(--brand-orange)] transition-[width] duration-500 ease-out"
          style={{ width: `${Math.max(progress, 6)}%` }}
        />
      </div>
    </div>
  );
}